local boardBounds
local boardSize
local boardThickness

local numColumns = 8

-- I get these just from eyeballing.
local columnWidth = 1.67
local rowHeight = 1.48

local xOffset = -7.5
local zOffset = -9.1
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
local waitForPlacement = 30


local crossTileRowIndices = {3, 4, 6, 7, 9, 10}
local maxCrossTileRowIndex = 10
local squirrelRowIndex = 8

local snapPoints = {}

local dispenserZones = {}
local squirrelZones = {}
local orderZones = {}
local crossTileZones = {}

local dispenserZonePrefix = "dispenserZone"
local squirrelZonePrefix = "squirrelZone"
local orderZonePrefix = "orderZone"
local crossTileZonePrefix = "crossTileZone"

local allZonePrefixes = {dispenserZonePrefix, orderZonePrefix, crossTileZonePrefix, squirrelZonePrefix}

local orderSlotToDispenserTypeMap = {}
local squirrelAffectsOrderSlot = {}

-- Local functions
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

local function isOrderCard(object)
    local pieces = mysplit(object.getName(), "_")
    if pieces and pieces[1] == "order" then
        return true
    else
        return false
    end
end

local function findEmptyOrderZones()
    local emptyOrderZones = {}
    for _, orderZone in pairs(orderZones) do
        local foundACard = false
        local objectsInZone = orderZone.getObjects()
        -- We only care about cards.
        for _, objectInZone in pairs(objectsInZone) do
            if not foundACard then
                if isOrderCard(objectInZone) then
                    foundACard = true
                end
            end
        end
        if not foundACard then
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

local function addZone(localPosition, zoneNamePrefix, zoneTable, rowIndex, columnIndex, opt_isThin)
    local worldPosition = self.positionToWorld(localPosition)
    worldPosition.y = 2
    local zone
    if opt_isThin then
        zone = thinZoneToClone.clone()
    else
        zone = zoneToClone.clone()
    end
    zone.setHiddenFrom(nil)
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

local function addDispenserSnapPointsAndZones()
    addSnapPointsAndZonesToRow(2, "dispensers", {
        zoneNamePrefix = dispenserZonePrefix,
        zoneTable = dispenserZones,
    })
end

local function addSalterSnapPoints()
    addSnapPointsAndZonesToRow(5, "salters")
end

local function addSquirrelSnapPointsAndZones()
    addSnapPointsAndZonesToRow(squirrelRowIndex, "squirrels", {
        zoneNamePrefix = squirrelZonePrefix,
        zoneTable = squirrelZones,
    })
end

local function addOrderSnapPointsAndZones()
    addSnapPointsAndZonesToRow(11, "orders", {
        extraZOffset = orderRowExtraZOffset,
        zoneNamePrefix = orderZonePrefix,
        zoneTable = orderZones,
    })
end

local function addCrossTileSnapPointsAndZones()
    for _, rowIndex in pairs(crossTileRowIndices) do
        for i = 1, numColumns-1 do
            local snapX = xOffset + columnWidth * (numColumns - 0.5 - i)
            local snapY = boardThickness
            local snapZ = zOffset + (rowIndex) * rowHeight
            local localPosition = Vector{snapX, snapY, snapZ}
            addSnapPointWithTag(localPosition, "crossTiles")

            addZone(localPosition, crossTileZonePrefix, crossTileZones, rowIndex, i, true)
        end
    end
end

local function orderMatchesDispenser(orderCard, emptyOrderZone)
    -- FIXME(dbanks)
    -- Lie.
    -- For now, reject all almond cards.
    print("Doug: orderMatchesDispenser")
    print("  Doug: orderCard.getName() = ", orderCard.getName())
    print("  Doug: emptyOrderZone = ", emptyOrderZone.getName())
    local zonePiecces = mysplit(emptyOrderZone.getName(), "_")
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
    Wait.frames(function()
        -- Card doesn't match attached dispenser?  Good: leave it.
        if not orderMatchesDispenser(card, emptyOrderZone) then
            -- It's good, leave it there, and move on to resolve the next one.
            table.remove(emptyOrderZones, zoneIndex)
            callback(true)
        else
            callback(false)
        end
    end, waitForPlacement)
end

local function discardCard(card)
    local orderDiscardTilePosition = orderDiscardTile.getPosition()
    local cardPosition = orderDiscardTilePosition
    cardPosition.y = cardPosition.y + 2
    card.setPositionSmooth(cardPosition)
    Wait.frames(function() local foo = 5 end, waitForPlacement)
end

local function tryToPlaceCardInFirstEmptyZone(card, emptyOrderZones, callback)
    local index = 1

    local function myCallback(success)
        if not success then
            index = index + 1
            if index <= #emptyOrderZones then
                tryToPlaceCardInNthEmptyZone(card, emptyOrderZones, index, myCallback)
            else
                discardCard(card)
                callback()
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
        local objectsInZone = dispenserZone.getObjects()
        for _, objectInZone in pairs(objectsInZone) do
            local pieces = mysplit(objectInZone.getName(), "_")
            if pieces and pieces[1] == "dispenser" then
                dispenserTypesByColumnNumber[index] = pieces[2]
            end
        end
    end
    return dispenserTypesByColumnNumber
end

local function makeCrossTilesByRowAndColumn()
    local crossTilesByRowAndColumn = {}
    for _, crossTileZone in pairs(crossTileZones) do
        local objectsInZone = crossTileZone.getObjects()
        for _, objectInZone in pairs(objectsInZone) do
            if objectInZone.getName() == "dsb_CrossTile" then
                local pieces = mysplit(crossTileZone.getName(), "_")
                local row = tonumber(pieces[2])
                local column = tonumber(pieces[3])
                crossTilesByRowAndColumn[row] = crossTilesByRowAndColumn[row] or {}
                crossTilesByRowAndColumn[row][column] = true
            end
        end
    end
    return crossTilesByRowAndColumn
end

local function getSquirrelColumn()
    local squirrelColumn
    for index, squirrelZone in pairs(squirrelZones) do
        local objectsInZone = squirrelZone.getObjects()
        for _, objectInZone in pairs(objectsInZone) do
            if objectInZone.getName() == "dsb_Squirrel" then
                squirrelColumn = index
            end
        end
    end
    return squirrelColumn
end

local function resetOrderSlotToDispenserTypeMap()
    orderSlotToDispenserTypeMap = {}
    squirrelAffectsOrderSlot = {}

    local dispenserTypesByColumnNumber = makeDispenserTypesByColumnNumber()

    local crossTilesByRowAndColumn = makeCrossTilesByRowAndColumn()

    -- Find the squirrel.
    local squirrelColumn = getSquirrelColumn()

    --[[
    print("Doug: dispenserTypesByColumnNumber")
    for j, dispenserType in pairs(dispenserTypesByColumnNumber) do
        print("  Doug: dispenserType = ", dispenserType)
        print("  Doug: j = ", j)
    end
    print("Doug: crossTilesByRowAndColumn")
    for rowNumber, columns in pairs(crossTilesByRowAndColumn) do
        for columnNumber, value in pairs(columns) do
            if value then
                print(  "Doug: cross tile at rowNumber = ", rowNumber, " columnNumber = ", columnNumber)
            end
        end
    end
    print("Doug: twiddling")
]]
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
           -- print("  Doug: rowNumber = ", rowNumber, " columnNumber = ", columnNumber, " adjustedColumnNumber = ", adjustedColumnNumber)

            if rowNumber == squirrelRowIndex then
                if squirrelColumn == adjustedColumnNumber then
                    squirrelAffectsOrderSlot = columnNumber
                end
            end
        end
        orderSlotToDispenserTypeMap[columnNumber] = dispenserTypesByColumnNumber[adjustedColumnNumber]
    end

    --[[
    print("Doug: orderSlotToDispenserMap")
    for orderSlot, dispenserType in pairs(orderSlotToDispenserTypeMap) do
        print("  Doug: dispenserType = ", dispenserType, " goes to order slot" , orderSlot)
    end
    print("Doug: squirrelAffectsOrderSlot = ", squirrelAffectsOrderSlot)
    ]]
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
    addDispenserSnapPointsAndZones()
    addSalterSnapPoints()
    addSquirrelSnapPointsAndZones()
    addCrossTileSnapPointsAndZones()
    addOrderSnapPointsAndZones()
    self.setSnapPoints(snapPoints)
end

function cleanup()
    dispenserZones = {}
    orderZones = {}
    crossTileZones = {}
    squirrelZones = {}

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
                for _, zonePrefix in pairs(allZonePrefixes) do
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

function refillOrderSlots()
    resetOrderSlotToDispenserTypeMap()

    -- 1. Figure out which order slots are empty.
    local emptyOrderZones = findEmptyOrderZones()
    print("Doug: #emptyOrderZones = ", #emptyOrderZones)

    -- This is recursive.
    resolveNextEmptyOrderZone(emptyOrderZones)
end

function hidePlacementZones(params)
    local seatedPlayerObjects = params.seatedPlayerObjects
    local seatedPlayerColors = {}
    for _, seatedPlayerObject in pairs(seatedPlayerObjects) do
        table.insert(seatedPlayerColors, seatedPlayerObject.color)
    end

    for _, zone in pairs(dispenserZones) do
        zone.setInvisibleTo(
            seatedPlayerColors
        )
    end
    for _, zone in pairs(squirrelZones) do
        zone.setInvisibleTo(
            seatedPlayerColors
        )
    end
    for _, zone in pairs(orderZones) do
        zone.setInvisibleTo(
            seatedPlayerColors
        )
    end
    for _, zone in pairs(crossTileZones) do
        zone.setInvisibleTo(
            seatedPlayerColors
        )
    end
end