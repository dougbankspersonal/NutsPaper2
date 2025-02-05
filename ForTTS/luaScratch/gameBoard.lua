--[[
gameBoard.lua
set up and controls for Nuts game board.
]]

local boardBounds
local boardSize
local boardThickness

local numColumns = 8

-- I get these just from eyeballing.
local columnWidth = 1.67
local rowHeight = 1.48

local xOffset = -7.5
local zOffset = -7.62
local orderRowExtraZOffset = 0.3

-- Object ids.
local zoneToCloneId = "bf7915"
local thinZoneToCloneId = "746731"
local orderDeckId = "6e5f4b"
local orderDiscardTileId = "cf0ba4"

-- Objects.
local zoneToClone
local thinZoneToClone
local orderDeck
local orderDiscardTile

-- Wait times in frames.
local waitForPlacementSec = 0.5

local maxCrossTileRowIndex = 10
local squirrelRowIndex = 8

local snapPoints = {}

local markerZonesByMarkerType = {}
local orderZones = {}
local crossTileZones = {}

local orderSlotToDispenserTypeMap = {}
local orderSlotIndexAffectedBySquirrel = nil
local ordersToDiscard = {}

-- Local functions
local function rowNameToZoneName(rowName)
    return rowName .. "Zone"
end

local function mysplit(inputstr, sep)
    if sep == nil then
        sep = "%s"
    end
    local t = {}
    for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
        table.insert(t, str)
    end
    return t
end

local function isSquirrel(object)
    return object.getName() == "dsb_Squirrel"
end

local function isCrossTile(object)
    return object.getName() == "dsb_CrossTile"
end

local function isDispenser(object)
    local pieces = mysplit(object.getName(), "_")
    if pieces and pieces[1] == "dispenser" then
        return true
    else
        return false
    end
end

local function isOrderCard(object)
    local pieces = mysplit(object.getName(), "_")
    if pieces and pieces[1] == "order" then
        return true
    else
        return false
    end
end

local function getObjectInZone(zone, callback)
    local objectsInZone = zone.getObjects()
    for _, objectInZone in pairs(objectsInZone) do
        if callback(objectInZone) then
            return objectInZone
        end
    end
    return nil
end

local function findEmptyOrderZones()
    local emptyOrderZones = {}
    for _, orderZone in pairs(orderZones) do
        local orderCard = getObjectInZone(orderZone, isOrderCard)

        if not orderCard then
            table.insert(emptyOrderZones, orderZone)
        end
    end
    return emptyOrderZones
end

local function addSnapPointWithTag(localPosition, tagName)
    local snapPoint = {
        position = localPosition,
        tags = {tagName},
        rotation = {0, 0, 0},
        rotation_snap = true,
    }
    table.insert(snapPoints, snapPoint)
end

local function hideZones(zones, seatedPlayerColors)
    for _, zone in pairs(zones) do
        zone.setInvisibleTo(
            seatedPlayerColors
        )
    end
end

local function addZone(localPosition, zoneNamePrefix, zoneTable, rowIndex, columnIndex, opt_isThin)
    local worldPosition = self.positionToWorld(localPosition)
    worldPosition.y = 2
    local zone
    if opt_isThin then
        zone = thinZoneToClone.clone()
    else
        zone = zoneToClone.clone()
    end
    zone.setPosition(worldPosition)
    local zoneName = zoneNamePrefix .. "_" .. tostring(rowIndex) .. "_" .. tostring(columnIndex)
    zone.setName(zoneName)
    table.insert(zoneTable, zone)
end

local function addSnapPointsAndZonesToRow(rowIndex, tagName, opt_configs)
    local configs = opt_configs or {}
    local extraZOffset = configs.extraZOffset or 0
    local zoneNamePrefix = configs.zoneNamePrefix
    local zoneTable = configs.zoneTable

    for i = 1, numColumns do
        local snapX = xOffset + columnWidth * (numColumns - i)
        local snapY = boardThickness
        local snapZ = extraZOffset + zOffset + (rowIndex) * rowHeight

        local localPosition = Vector{snapX, snapY, snapZ}
        addSnapPointWithTag(localPosition, tagName)

        if zoneNamePrefix then
            addZone(localPosition, zoneNamePrefix, zoneTable, rowIndex, i)
        end
    end
end

local function addMarkerSnapPointsAndZones(rowIndex, rowName)
    markerZonesByMarkerType[rowName] = {}
    addSnapPointsAndZonesToRow(rowIndex, rowName, {
        zoneNamePrefix = rowNameToZoneName(rowName),
        zoneTable = markerZonesByMarkerType[rowName],
    })
end

local function addOrderSnapPointsAndZones(rowIndex, rowName)
    addSnapPointsAndZonesToRow(rowIndex, rowName, {
        extraZOffset = orderRowExtraZOffset,
        zoneNamePrefix = rowNameToZoneName(rowName),
        zoneTable = orderZones,
    })
end

local function addCrossTileSnapPointsAndZones(rowIndex, rowName)
    for i = 1, numColumns-1 do
        local snapX = xOffset + columnWidth * (numColumns - 0.5 - i)
        local snapY = boardThickness
        local snapZ = zOffset + (rowIndex) * rowHeight
        local localPosition = Vector{snapX, snapY, snapZ}
        addSnapPointWithTag(localPosition, rowName)

        addZone(localPosition, rowNameToZoneName(rowName), crossTileZones, rowIndex, i, true)
    end
end

local function prepForDiscard(orderCard)
    local position = orderCard.getPosition()
    position.y = position.y + 2
    position.z = position.z - 3
    orderCard.setPositionSmooth(position)

    table.insert(ordersToDiscard, orderCard)
end

local function orderCardMatchesDispenserForZone(orderCard, orderZone)
    local zonePiecces = mysplit(orderZone.getName(), "_")
    local orderSlotIndex = tonumber(zonePiecces[3])
    local pieces = mysplit(orderCard.getName(), "_")
    local cardType = pieces[2]
    local dispenserTypeForOrderSlot = orderSlotToDispenserTypeMap[orderSlotIndex]
    if dispenserTypeForOrderSlot == cardType then
        return true
    end
    return false
end

local function tryToPlaceCardInNthEmptyZone(card, emptyOrderZones, zoneIndex, callback)
    local emptyOrderZone = emptyOrderZones[zoneIndex]
    local slotPosition = emptyOrderZone.getPosition()
    local cardPosition = slotPosition
    cardPosition.y = cardPosition.y + 2
    card.setPositionSmooth(cardPosition)
    Wait.time(function()
        -- Card doesn't match attached dispenser?  Good: leave it.
        if not orderCardMatchesDispenserForZone(card, emptyOrderZone) then
            -- It's good, leave it there, and move on to resolve the next one.
            table.remove(emptyOrderZones, zoneIndex)
            callback(true)
        else
            callback(false)
        end
    end, waitForPlacementSec)
end

local function discardCard(card, opt_callback)
    local orderDiscardTilePosition = orderDiscardTile.getPosition()
    local cardDestinationPosition = orderDiscardTilePosition
    cardDestinationPosition.y = cardDestinationPosition.y + 2
    card.setPositionSmooth(cardDestinationPosition)
    Wait.time(function()
        if opt_callback then
            opt_callback()
        end
    end, waitForPlacementSec)
end

local function tryToPlaceCardInFirstEmptyZone(card, emptyOrderZones, callback)
    local index = 1

    local function myCallback(success)
        if not success then
            index = index + 1
            if index <= #emptyOrderZones then
                tryToPlaceCardInNthEmptyZone(card, emptyOrderZones, index, myCallback)
            else
                discardCard(card, callback)
            end
        else
            callback()
        end
    end

    tryToPlaceCardInNthEmptyZone(card, emptyOrderZones, index, myCallback)
end

local function resolveNextEmptyOrderZone(emptyOrderZones)
    if #emptyOrderZones == 0 then
        return
    end

    -- Flip the next Order card.
    local card = orderDeck.takeObject()
    card.flip()
    tryToPlaceCardInFirstEmptyZone(card, emptyOrderZones, function()
        -- Fill the next empty zone.
        resolveNextEmptyOrderZone(emptyOrderZones)
    end)
end

local function makeDispenserTypesByColumnNumber()
    local dispenserTypesByColumnNumber = {}
    for index, dispenserZone in pairs(dispenserZones) do
        local dispenser = getObjectInZone(dispenserZone, isDispenser)
        if dispenser then
            local pieces = mysplit(dispenser.getName(), "_")
            dispenserTypesByColumnNumber[index] = pieces[2]
        end
    end
    return dispenserTypesByColumnNumber
end

local function makeCrossTilesByRowAndColumn()
    local crossTilesByRowAndColumn = {}
    for _, crossTileZone in pairs(crossTileZones) do
        local crossTileObject = getObjectInZone(crossTileZone, isCrossTile)

        if crossTileObject then
            local pieces = mysplit(crossTileZone.getName(), "_")
            local row = tonumber(pieces[2])
            local column = tonumber(pieces[3])
            crossTilesByRowAndColumn[row] = crossTilesByRowAndColumn[row] or {}
            crossTilesByRowAndColumn[row][column] = true
        end
    end
    return crossTilesByRowAndColumn
end

local function getSquirrelColumn()
    local squirrelZones = markerZonesByMarkerType["Squirrel"]
    for index, squirrelZone in pairs(squirrelZones) do
        local squirrelObject = getObjectInZone(squirrelZone, isSquirrel)

        if squirrelObject then
            return index
        end
    end
    return nil
end

local function discardNextOrderCard()
    if #ordersToDiscard == 0 then
        return
    end

    local card = table.remove(ordersToDiscard, 1)

    discardCard(card, discardNextOrderCard)
end

local function resetOrderSlotToDispenserTypeMap()
    orderSlotToDispenserTypeMap = {}
    orderSlotIndexAffectedBySquirrel = nil

    local dispenserTypesByColumnNumber = makeDispenserTypesByColumnNumber()

    local crossTilesByRowAndColumn = makeCrossTilesByRowAndColumn()

    -- Find the squirrel.
    local squirrelColumn = getSquirrelColumn()

    for columnNumber = 1, numColumns do
        local adjustedColumnNumber = columnNumber
        for rowNumber = maxCrossTileRowIndex, 1, -1 do
            local columnMod = 0
            if crossTilesByRowAndColumn[rowNumber] and crossTilesByRowAndColumn[rowNumber][adjustedColumnNumber] then
                columnMod = 1
            end
            if adjustedColumnNumber >= 2 and crossTilesByRowAndColumn[rowNumber] and crossTilesByRowAndColumn[rowNumber][adjustedColumnNumber-1] then
                columnMod = -1
            end
            adjustedColumnNumber = adjustedColumnNumber + columnMod

            if rowNumber == squirrelRowIndex then
                if squirrelColumn == adjustedColumnNumber then
                    orderSlotIndexAffectedBySquirrel = columnNumber
                end
            end
        end
        orderSlotToDispenserTypeMap[columnNumber] = dispenserTypesByColumnNumber[adjustedColumnNumber]
    end
end

-- Member functions
function onLoad()
    boardBounds = self.getBounds()
    boardSize = boardBounds.size
    boardThickness = boardSize.y

    zoneToClone = getObjectFromGUID(zoneToCloneId)
    thinZoneToClone = getObjectFromGUID(thinZoneToCloneId)
    orderDeck = getObjectFromGUID(orderDeckId)
    orderDiscardTile = getObjectFromGUID(orderDiscardTileId)
end

function setup()
    local rowNames = Global.call("getRowNames")

    for index, rowName in pairs(rowNames) do
        if rowName == "Dispensers" or rowName == "Squirrel" or rowName == "Salters" or rowName == "Roasters" then
            addMarkerSnapPointsAndZones(index, rowName)
        elseif rowName == "Orders" then
            addOrderSnapPointsAndZones(index, rowName)
        elseif rowName == "Conveyors" then
            addCrossTileSnapPointsAndZones(index, rowName)
        end
    end
    self.setSnapPoints(snapPoints)
end

function cleanup()
    markerZonesByMarkerType = {}
    orderZones = {}
    crossTileZones = {}

    local allZonePrefixes = {}
    local rowNames = Global.call("getRowNames")
    for _, rowName in pairs(rowNames) do
        local zoneNamePrefix = rowNameToZoneName(rowName)
        allZonePrefixes[zoneNamePrefix] = true
    end

    local printedTypes = {}
    self.setSnapPoints({})
    -- remove all zones I created.
    local allObjects = getObjects()
    for _, object in pairs(allObjects) do
        if not printedTypes[object.type] then
            printedTypes[object.type] = true
        end
        if object.type == "Fog" then
            local objectName = object.getName()
            local pieces = mysplit(objectName, "_")
            if pieces and pieces[1] then
                local shouldDelete = false
                for zonePrefix, _ in pairs(allZonePrefixes) do
                    if pieces[1] == zonePrefix then
                        shouldDelete = true
                    end
                end
                if shouldDelete then
                    object.destruct()
                end
            end
        end
    end
end

function discardOrderCards()
    discardNextOrderCard()
end

function resolveOrders()
    resetOrderSlotToDispenserTypeMap()

    for _, orderCardZone in pairs(orderZones) do
        local orderCard = getObjectInZone(orderCardZone, isOrderCard)
        if orderCard then
            if orderCardMatchesDispenserForZone(orderCard, orderCardZone) then
                prepForDiscard(orderCard)
            end
        end
    end
end

function resolveSquirrel()
    resetOrderSlotToDispenserTypeMap()

    -- What order slot does the squirrel affect?
    if orderSlotIndexAffectedBySquirrel then
        local dispenserTypeForOrderSlot = orderSlotToDispenserTypeMap[orderSlotIndexAffectedBySquirrel]

        -- Move that card out/down a little.  Add to "to discard" array.
        local orderCardZone = orderZones[orderSlotIndexAffectedBySquirrel]
        local orderCard = getObjectInZone(orderCardZone, isOrderCard)
        if orderCard then
            if orderCardMatchesDispenserForZone(orderCard, orderCardZone) then
                prepForDiscard(orderCard)
            end
        end
    end
end

function refillOrderSlots()
    resetOrderSlotToDispenserTypeMap()

    -- 1. Figure out which order slots are empty.
    local emptyOrderZones = findEmptyOrderZones()

    -- This is recursive.
    resolveNextEmptyOrderZone(emptyOrderZones)
end
