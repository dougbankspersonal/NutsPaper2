--[[
global.lua
global logic and values.
]]

--[[
Local vars
]]
-- versions, current version.
local version_004_02 = "v004.02"
local version_005_01 = "v005.01"

local currentVersion = version_005_01

-- Storage
local createdObjectsByPlayerColor = {}
local scoresByPlayerColor = {}

-- Times
local sumWaitSec = 0.1
local standardWaitSec = 0.5
local waitForCardToFallSec = 2

-- Positions
local outOfTheWayPositionY = -10
local scoreSheetPositionX = 5
local scoreSheetPositionY = 2

-- Object GUIDs
local agendaDeckId = "62a965"
local nonSquirrelGoalDeckId = "7d5317"
local squirrelDeckId = "0db96d"
local orderDeckId = "6e5f4b"
local scoreCardId = "dd5da2"
local tokenId = "442fb4"
local crossTilePileId = "661366"
local gameBoardId = "cbf28b"

local gameBoard

-- Token layout.
local numTokens = 30
local tokensPerRow = 6
local tokenRowWidth = 0.6
local numTokenRows = math.floor(numTokens/tokensPerRow)
local tokenColumnHeight = 0.6
local tokenRightOffset = 3
local tokenForwardAdjustment = -tokenColumnHeight * (numTokenRows-1)/2

-- XML stuff.
local pristineXML = {}

local rowHeight = 30
local labelColumnWidth = 150
local nonLabelColumnWidth = 200
local titleHeight = 50

local titleRowColor = "#ddffff"
local playerRowColor = "#cccccc"
local evenRowColor = "#aacccc"
local oddRowColor = "#aaaacc"
local sumRowColor = "#cccccc"

local inputCellNamesByVersion = {}
inputCellNamesByVersion[version_004_02] = {
    "Cells",
    "Rows",
    "Salt",
    "Bonus Cards",
    "Agenda Cards",
}

inputCellNamesByVersion[version_005_01] = {
    "Cells",
    "Rows",
    "Salted",
    "Roasted",
    "Roasted and Salted",
}

local decksIdsByVersion = {}
decksIdsByVersion[version_004_02] = {
    [agendaDeckId] = true,
    [nonSquirrelGoalDeckId] = true,
    [squirrelDeckId] = true,
    [orderDeckId] = true,
    [crossTilePileId] = true,
}
decksIdsByVersion[version_005_01] = {
    [orderDeckId] = true,
    [crossTilePileId] = true,
}

local rowNamesByVersion = {}
rowNamesByVersion[version_004_02] = {
    "Dispensers",
    "Conveyors",
    "Conveyors",
    "Salters",
    "Conveyors",
    "Conveyors",
    "Squirrel",
    "Conveyors",
    "Conveyors",
    "Orders",
}

rowNamesByVersion[version_005_01] = {
    "Dispensers",
    "Conveyors",
    "Conveyors",
    "Salters",
    "Conveyors",
    "Squirrel",
    "Conveyors",
    "Roasters",
    "Conveyors",
    "Conveyors",
    "Orders",
}


--[[
Local functions
]]
local function deckIsInUse(guid)
    return decksIdsByVersion[currentVersion][guid] ~= nil
end

local function getInputCellNames()
    return inputCellNamesByVersion[currentVersion]
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

local function getStoredScore(playerColor, inputCellName)
    if scoresByPlayerColor[playerColor] == nil then
        scoresByPlayerColor[playerColor] = {}
    end
    if scoresByPlayerColor[playerColor][inputCellName] == nil then
        scoresByPlayerColor[playerColor][inputCellName] = 0
    end
    return scoresByPlayerColor[playerColor][inputCellName]
end

local function setStoredScore(playerColor, inputCellName, score)
    if scoresByPlayerColor[playerColor] == nil then
        scoresByPlayerColor[playerColor] = {}
    end
    scoresByPlayerColor[playerColor][inputCellName] = score
end

local function dump(blob, opt_params)
    local params = opt_params or {}
    local indent = params.indent or ""
    local recursive = true
    if params.nonRecursive then
        recursive = false
    end

    if type(blob) ~= "table" then
        print("blob is not a table!")
        return
    end

    local newParams = {}
    newParams.indent = indent .. "  "
    newParams.nonRecursive = false
    for key, value in pairs(blob) do
        local prefix = indent .. key .. " = "
        print(prefix, value)
        if recursive and type(value) == "table" then
            dump(value, newParams)
        end
    end
end

local function resetDeck(guid)
    if deckIsInUse(guid) then
        local deck = getObjectFromGUID(guid)
        deck.reset()
    end
end

local function shuffleDeck(guid)
    local deck = getObjectFromGUID(guid)
    deck.randomize()
end

local function cleanupObjectsForPlayer(playerColor)
    local objects = createdObjectsByPlayerColor[playerColor]
    for _, obj in pairs(objects) do
        obj.destruct()
    end
    createdObjectsByPlayerColor[playerColor] = {}
end

local function cleanupScoresForPlayer(playerColor)
    scoresByPlayerColor[playerColor] = {}
end

local function cleanupEverything(_)
    -- Reset all the cards.
    resetDeck(agendaDeckId)
    resetDeck(nonSquirrelGoalDeckId)
    resetDeck(squirrelDeckId)
    resetDeck(orderDeckId)
    resetDeck(crossTilePileId)

    UI.setXmlTable(pristineXML)

    -- Destroy all the created objects.
    -- Reset stored scores.
    for playerColor, _ in pairs(createdObjectsByPlayerColor) do
        cleanupObjectsForPlayer(playerColor)
        cleanupScoresForPlayer(playerColor)

    end
    createdObjectsByPlayerColor = {}
end


local function getSeatedPlayerObjects()
    -- Array of Player instances.
    local allPlayers = Player.getPlayers()
    -- Array of colors of Seated Players.
    local seatedPlayerColors = getSeatedPlayers()

    -- Array of Seated Player instances.
    -- Fill it in.
    -- Along the way figure out which player is the clicker.
    local _seatedPlayerObjects = {}
    for _, seatedPlayerColor in pairs(seatedPlayerColors) do
        for _, player in pairs(allPlayers) do
            if player.color == seatedPlayerColor then
                table.insert(_seatedPlayerObjects, player)
            end
        end
    end
    return _seatedPlayerObjects
end

local function storeCreatedObject(playerColor, obj)
    if createdObjectsByPlayerColor[playerColor] == nil then
        createdObjectsByPlayerColor[playerColor] = {}
    end
    table.insert(createdObjectsByPlayerColor[playerColor], obj)
end

-- Given an XML id, walk the given xml blob to find an element with given
-- id.
local function findXMLNodeWithId(xmlNode, name, opt_params)
    local params = opt_params or {}
    local recursive = true
    if params.nonRecursive then
        recursive = false
    end
    for _, childXmlNode in pairs(xmlNode) do
        for key, value in pairs(childXmlNode) do
            if key == "attributes" then
                for attributeKey, attributeValue in pairs(value) do
                    if attributeKey == "id" and attributeValue == name then
                        return childXmlNode
                    end
                end
            end
            if recursive then
                if key == "children" then
                    local result = findXMLNodeWithId(value, name, params)
                    if result then
                        return result
                    end
                end
            end
        end
    end

    return nil
end

local function safeAddToXmlAttributes(xmlNode, attributes)
    if xmlNode and attributes then
        if xmlNode.attributes == nil then
            xmlNode.attributes = {}
        end
        for key, value in pairs(attributes) do
            xmlNode.attributes[key] = value
        end
    end
end

local function safeAddToXmlChildren(xmlParent, xmlChild)
    if xmlParent and xmlChild then
        if xmlParent.children == nil then
            xmlParent.children = {}
        end
        table.insert(xmlParent.children, xmlChild)
    end
end

local function makeXmlNode(tag, attributes)
    local xmlNode = {
        tag = tag,
        attributes = attributes,
        children = {},
    }
    return xmlNode
end

local function makeRowId(rowIndex)
    return "Row_" .. rowIndex
end

local function makeId(prefix, rowIndex, columnIndex)
    return prefix .. "_" .. rowIndex .. "_" .. columnIndex
end

local function makeXmlRow(rowIndex, rowClass)
    local rowId = makeRowId(rowIndex)
    local xmlRow = makeXmlNode("Row", {
        id = rowId,
        class = rowClass,
        preferredHeight=tostring(rowHeight),
    })
    return xmlRow
end

local function makeXmlText(textId, text, classPrefix)
    local xmlText = makeXmlNode("Text", {
        class = classPrefix .. "TextClass",
        id = textId,
        text = text,
    })

    return xmlText
end

local function makeXmlTextCell(rowIndex, columnIndex, cellText, classPrefix)
    local cellId = makeId("Cell", rowIndex, columnIndex)
    local textId = makeId("Text", rowIndex, columnIndex)

    local xmlCell = makeXmlNode("Cell", {
        class = classPrefix .. "CellClass",
        id = cellId,
    })
    local xmlText = makeXmlText(textId, cellText, classPrefix)
    safeAddToXmlChildren(xmlCell, xmlText)
    return xmlCell
end

local function makeXmlLabelCell(rowIndex, columnIndex, cellText)
    local xmlLabelCell = makeXmlTextCell(rowIndex, columnIndex, cellText, "Label")
    return xmlLabelCell
end

local function makeXmlPlayerNameCell(rowIndex, columnIndex, cellText)
    local xmlPlayerNameCell = makeXmlTextCell(rowIndex, columnIndex, cellText, "PlayerName")
    return xmlPlayerNameCell
end

local function makeXmlSumCell(rowIndex, columnIndex, cellText)
    local xmlSumCell = makeXmlTextCell(rowIndex, columnIndex, cellText, "Sum")
    return xmlSumCell
end

local function makeXmlInputCell(rowIndex, columnIndex, seatedPlayerColor)
    local cellId = makeId("Cell", rowIndex, columnIndex)
    local inputId = makeId("Input", rowIndex, columnIndex)

    local xmlCell = makeXmlNode("Cell", {
        class = "InputCellClass",
        id = cellId,
        color = seatedPlayerColor,
    })
    dump(xmlCell)

    local inputCellNames = getInputCellNames()
    local scoreForCellNumber = getStoredScore(seatedPlayerColor, inputCellNames[rowIndex])

    local xmlInput = makeXmlNode("InputField", {
        class = "InputClass",
        id = inputId,
        text = tostring(scoreForCellNumber),
        onEndEdit = "updateScore",
    })
    safeAddToXmlChildren(xmlCell, xmlInput)

    xmlInput.attributes.width = tostring(nonLabelColumnWidth/2)
    xmlInput.attributes.height = tostring(rowHeight)

    return xmlCell
end

local function makeTitleRow(numSeatedPlayerObjects)
    local xmlRow = makeXmlRow("title", "TextRowClass")
    safeAddToXmlAttributes(xmlRow, {
        color  = titleRowColor,
    })

    -- Label cell.
    local xmlLabelCell = makeXmlLabelCell(0, 0, "Final Tally")
    safeAddToXmlAttributes(xmlLabelCell, {
        columnSpan = tostring(numSeatedPlayerObjects + 1),
    })

    safeAddToXmlChildren(xmlRow, xmlLabelCell)

    return xmlRow
end

local function makePlayerRow(rowIndex, seatedPlayerObjects)
    local xmlRow = makeXmlRow(rowIndex, "TextRowClass")
    safeAddToXmlAttributes(xmlRow, {
        color  = playerRowColor,
    })

    -- Label cell.
    local xmlLabelCell = makeXmlLabelCell(rowIndex, 0, "Player Name")
    safeAddToXmlChildren(xmlRow, xmlLabelCell)

    -- One cell for each player: fill with player name.
    for columnIndex, seatedPlayer in pairs(seatedPlayerObjects) do
        local xmlPlayerNameCell = makeXmlPlayerNameCell(rowIndex, columnIndex, seatedPlayer.steam_name)
        safeAddToXmlChildren(xmlRow, xmlPlayerNameCell)
    end
    return xmlRow
end

local function makeNthInputRow(rowIndex, rowLabel, seatedPlayerObjects)
    local rowColor
    if rowIndex % 2 == 0 then
        rowColor = evenRowColor
    else
        rowColor = oddRowColor
    end
    local xmlRow = makeXmlRow(rowIndex, "InputRowClass")
    safeAddToXmlAttributes(xmlRow, {
        color=rowColor,
    })

    -- Label cell.
    local xmlLabelCell = makeXmlLabelCell(rowIndex, 0, rowLabel)
    safeAddToXmlChildren(xmlRow, xmlLabelCell)

    -- One cell for each player: fill with input widget.
    for columnIndex, seatedPlayerObject in pairs(seatedPlayerObjects) do
        local xmlInputCell = makeXmlInputCell(rowIndex, columnIndex, seatedPlayerObject.color)
        safeAddToXmlChildren(xmlRow, xmlInputCell)
    end
    return xmlRow
end

local function makeSumRow(rowIndex, numSeatedPlayerObjects)
    local xmlRow = makeXmlRow(rowIndex, "TextRowClass")
    safeAddToXmlAttributes(xmlRow, {
        color  = sumRowColor,
    })

    -- Label cell.
    local xmlLabelCell = makeXmlLabelCell(rowIndex, 0, "Total")
    safeAddToXmlChildren(xmlRow, xmlLabelCell)

    -- One cell for each player: fill with zeros.
    for columnIndex = 1, numSeatedPlayerObjects do
        local xmlSumCell = makeXmlSumCell(rowIndex, columnIndex, "0")
        safeAddToXmlChildren(xmlRow, xmlSumCell)
    end
    return xmlRow
end

local function getRowAndColumn(textString)
    local pieces = mysplit(textString, "_")
    local rowIndex = tonumber(pieces[2])
    local columnIndex = tonumber(pieces[3])
    return rowIndex, columnIndex
end

--[[
Member functions
]]
function updateScore(_, textValue, inputId)
    UI.setAttribute(inputId, "text", textValue)
    Wait.time(function()
        local rowIndex, columnIndex = getRowAndColumn(inputId)
        local inputCellNames = getInputCellNames()

        -- Store the value.
        -- What player color are we dealing with?
        local cellId = makeId("Cell", rowIndex, columnIndex)
        local seatedPlayerColor = UI.getAttribute(cellId, "color")

        setStoredScore(seatedPlayerColor, inputCellNames[rowIndex], tonumber(textValue))

        -- re-sum the column
        local sum = 0
        for _, inputCellName in pairs(inputCellNames) do
            local intValue = getStoredScore(seatedPlayerColor, inputCellName)
            if intValue then
                sum = sum + intValue
            end
        end
        local sumId = makeId("Text", #inputCellNames + 1, columnIndex)
        UI.setAttribute(sumId, "text", tostring(sum))
    end, sumWaitSec)
end

function onObjectLeaveContainer(container, leave_object)
   if container.type == "Deck" then
    leave_object.setTags(container.getTags())
  end
end

-- For score card and tokens we have prototypes: move them somewhere hidden from players.
function movePrototype(params)
    local obj = params.obj
    local guid = params.guid
    if obj.guid == guid then
        local position = obj.getPosition()
        position.y = outOfTheWayPositionY
        obj.setPosition(position)
    end
end

function setupSeatedPlayer(seatedPlayer)
    local handTransform = seatedPlayer.getHandTransform()
    local spawnRotation = handTransform.rotation + Vector{0,180,0}
    local forward_unit = handTransform.forward
    local right_unit = handTransform.right
    local spawnPosition = handTransform.position + forward_unit * scoreSheetPositionX
    spawnPosition.y = scoreSheetPositionY

    local sourceScoreCard = getObjectFromGUID(scoreCardId)
    local sourceToken = getObjectFromGUID(tokenId)

    local scoreCard = sourceScoreCard.clone({
        position = spawnPosition
    })
    scoreCard.locked = false
    scoreCard.setPosition(spawnPosition)
    storeCreatedObject(seatedPlayer.color, scoreCard)
    scoreCard.setRotation(spawnRotation)
    Wait.time(function()
        scoreCard.locked = true
    end, waitForCardToFallSec)

    for i = 1, numTokenRows do
        for j = 1, tokensPerRow do
            local rightAdjustment = right_unit * (tokenRightOffset + (j-1) * tokenRowWidth)
            local forwardAdjustment = forward_unit * (tokenForwardAdjustment + (i-1) * tokenColumnHeight)
            local tokenPosition = spawnPosition + rightAdjustment + forwardAdjustment
            local token = sourceToken.clone({
                position = tokenPosition
            })
            token.locked = false
            token.setPosition(tokenPosition)
            storeCreatedObject(seatedPlayer.color, token)
            token.setRotation(spawnRotation)
            local color = seatedPlayer.color
            if color == "White" then
                -- Make it a little off-white to make it more visible.
                color = {200/255, 200/255, 200/255,}
            end
            token.setColorTint(color)
        end
    end

    if deckIsInUse(agendaDeckId) then
        -- Give everyone 2 agendas.
        local agendaDeck = getObjectFromGUID(agendaDeckId)
        agendaDeck.deal(3, seatedPlayer.color)
    end
end

function setupSeatedPlayers()
    -- Do per-player setup.
    local seatedPlayerObjects = getSeatedPlayerObjects()

    for _, seatedPlayer in pairs(seatedPlayerObjects) do
        setupSeatedPlayer(seatedPlayer)
    end
    return 1
end

function updateXML()
    local seatedPlayerObjects = getSeatedPlayerObjects()
    local numSeatedPlayerObjects = #seatedPlayerObjects
    local moddedXML = UI.GetXmlTable()
    local panel = findXMLNodeWithId(moddedXML, "FinalTallyPanel")

    local panelWidth = labelColumnWidth + nonLabelColumnWidth * numSeatedPlayerObjects
    local panelHeight = titleHeight + rowHeight * (#inputCellNames + 2)

    safeAddToXmlAttributes(panel, {
        height = tostring(panelHeight),
        width = tostring(panelWidth),
        offsetXY = "-50 0",
    })

    local columnWidths = tostring(labelColumnWidth)
    for _ = 1, numSeatedPlayerObjects do
        columnWidths = columnWidths .. " " .. tostring(nonLabelColumnWidth)
    end

    local xmlTableLayout = makeXmlNode("TableLayout", {
        class = "FinalTallyTableLayoutClass",
        id = "FinalTallyTableLayout",
        columnWidths = columnWidths,
        ignoreLayout="true",
    })
    safeAddToXmlChildren(panel, xmlTableLayout)

    local xmlRow = makeTitleRow(numSeatedPlayerObjects)
    safeAddToXmlAttributes(xmlRow, {
        preferredHeight = tostring(titleHeight),
    })
    safeAddToXmlChildren(xmlTableLayout, xmlRow)

    xmlRow = makePlayerRow(0, seatedPlayerObjects)
    safeAddToXmlChildren(xmlTableLayout, xmlRow)

    for index, inputCellName in pairs(inputCellNames) do
        xmlRow = makeNthInputRow(index, inputCellName, seatedPlayerObjects)
        safeAddToXmlChildren(xmlTableLayout, xmlRow)
    end

    xmlRow = makeSumRow(#inputCellNames + 1, numSeatedPlayerObjects)
    safeAddToXmlChildren(xmlTableLayout, xmlRow)

    UI.setXmlTable(moddedXML)
end

--[[
Functions called from global.xml
]]
function setup(clickedPlayer)
    -- Cleanup old spawns.
    cleanupEverything()

    Wait.time(function()
        gameBoard.call("setup")
        Wait.time(function()
            startLuaCoroutine(Global, "setupSeatedPlayers")
        end, standardWaitSec)
    end, standardWaitSec)
end

function cleanup()
    cleanupEverything()
    gameBoard.call("cleanup")
end

--[[
Functions called from global.xml
]]

function toggleFinalTally()
    local finalTallyActiveValue = UI.getAttribute("FinalTallyPanel", "active")
    if finalTallyActiveValue == "true" then
        UI.hide("FinalTallyPanel")
    else
        -- reset XML to base.
        UI.setXmlTable(pristineXML)

        -- rebuild the page based on current number of players and all.
        updateXML()
        UI.show("FinalTallyPanel")
    end
end

function refillOrderSlots()
    gameBoard.call("refillOrderSlots")
end

function resolveSquirrel()
    gameBoard.call("resolveSquirrel")
end

function resolveOrders()
    gameBoard.call("resolveOrders")
end

function discardOrderCards()
    gameBoard.call("discardOrderCards")
end

function getRowNames()
    return rowNamesByVersion[currentVersion]
end

--[[
Main onLoad/onUpdate functions
]]
-- The onLoad event is called after the game save finishes loading.
function onLoad()
    -- Keep a clean copy around for when we reset.
    print("Doug: onLoad 001")
    pristineXML = UI.GetXmlTable();
    print("Doug: onLoad 002")
    gameBoard = getObjectFromGUID(gameBoardId)
    print("Doug: onLoad 003")
end

-- The onUpdate event is called once per frame.
function onUpdate()
    --[[ print('onUpdate loop!') --]]
end

function onPlayerChangeColor(color)
end

function onPlayerDisconnect(player)
    cleanupObjectsForPlayer(player.color)
    cleanupScoresForPlayer(player.color)
end