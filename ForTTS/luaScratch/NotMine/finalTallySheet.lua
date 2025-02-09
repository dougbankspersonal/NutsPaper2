-- Global Variables
local XML = {}
local Scores = {}
local RowsAdded = 1
local ColumnsAdded = 1

function onLoad(saved_data)
  XML = UI.GetXmlTable();

  --Load Data
  if saved_data ~= "" then
    local loaded_data = JSON.decode(saved_data)

    --Set Global Variables
    RowsAdded     = loaded_data.RowsAdded
    ColumnsAdded  = loaded_data.ColumnsAdded
    Scores        = loaded_data.Scores
  end

  RestoreScoreSheet()
end

function RestoreScoreSheet()
  --Temporary store the saved values
  local rAdded  = RowsAdded - 1
  local cAdded  = ColumnsAdded - 1
  RowsAdded = 1
  ColumnsAdded = 1

  --Restore all Rows
  for i = 1, rAdded do
    AddRow()
  end

  --Restore all columns
  for i = 1, cAdded do
    AddColumn()
  end

  --Restore Values
  startLuaCoroutine(Global, "ScoreSheetSetup")
end

function onSave()
  --Save Global Variables
  SaveScores()
  saved_data = JSON.encode({["RowsAdded"] = RowsAdded, ["ColumnsAdded"] = ColumnsAdded, ["Scores"] = tableCullNumericIndexes(Scores)})
  --saved_data = JSON.encode({["RowsAdded"] = 1, ["ColumnsAdded"] = 1, ["Scores"] = {}})
  return saved_data
end

function onPlayerChangeColor(player_color)
  if player_color ~= "Grey" then
    --Save current Score
    SaveScores()

    playerCount = #getSeatedPlayers()
    --Add Colums if needed
    for i = 1, playerCount - ColumnsAdded do
      AddColumn()
    end


    --Set Values and Colors
    startLuaCoroutine(Global, "ScoreSheetSetup")
  end
end

function ScoreSheetSetup()
  coroutine.yield(0)
  SetColumnColors()
  LoadScores()
  UpdateTotalScore()
  return 1
end

function SaveScores()
  for player = 1, ColumnsAdded do
    local scoreT = {}
    for score = 1, RowsAdded do
      local scoreId = "I_S".. score .."P".. player
      table.insert(scoreT, UI.getAttribute(scoreId, "text"))
    end
    Scores[UI.getAttribute("P"..player, "text")] = scoreT;
  end
end

function LoadScores()
  --Load each single score
  for player = 1, ColumnsAdded do
    for score = 1, RowsAdded do
      local scoreId = "I_S".. score .."P".. player
      local color = UI.getAttribute("P"..player, "text")
      if Scores[color] ~= nil and Scores[color][score] ~= nil then
        UI.setAttribute(scoreId, "text", Scores[UI.getAttribute("P"..player, "text")][score])
      else
        UI.setAttribute(scoreId, "text", "0")
      end
    end
  end
end

function ClosePanel()
  UI.setAttribute("ScoreSheetPanel", "active", "false")
end

function IncrementScore(player, value, id)
  local scoreId = string.sub(id, 2)
  local score = tonumber(UI.getAttribute(scoreId, "text"))
  UI.setAttribute(scoreId, "text", tonumber(score)+1)
  UpdateTotalScore()
end

function DecrementScore(player, value, id)
  local scoreId = "I" .. string.sub(id, 3)
  local score = tonumber(UI.getAttribute(scoreId, "text"))
  UI.setAttribute(scoreId, "text", tonumber(score)-1)
  UpdateTotalScore()
end

function UpdateScore(player, value, id)
  if value == "" then
    return
  end

  UI.setAttribute(id, "text", value)
  UpdateTotalScore()
end

function UpdateTotalScore()
  local scoreId = ""
  for player = 1, ColumnsAdded do
    local score = 0
    for row = 1, RowsAdded do
      scoreId = "I_S" .. row .. "P" .. player
      if UI.getAttribute(scoreId, "text") ~= nil then
        score = score + tonumber(UI.getAttribute(scoreId, "text"))
      end
    end
    UI.setAttribute("TSP"..player, "text", score)
  end
end

function AddRow()
  SaveScores()
  RowsAdded = RowsAdded + 1

  --Define XML Elements
  local ScoreRow = {
    ["tag"]         = "Row",
    ["attributes"]  = {
      ["id"]          = "ScoreRow"..RowsAdded,
      ["class"]       = "ScoreTableRow"},
    ["children"]    = {}}

  --The FirstCell should look like this: <Cell><Text id="Score1">Score 1</Text></Cell>
  local FirstCell = {
    ["tag"]         = "Cell",
    ["children"]    = {{
      ["tag"]         = "Text",
      ["value"]        = "Score " .. RowsAdded,
      ["attributes"]  = {
        ["id"] = "Score".. RowsAdded}
    }}}

  --Add Cell1 to ScoreRow
  table.insert(ScoreRow["children"], FirstCell)

  --Add other Cells to ScoreRow
  --These Cells look like this:
  --[[
    <Cell>
      <Button id="BD_S1P1" class="PMButton" onClick="DecrementScore" />
      <InputField id="I_S1P1" class="UIInputField" characterValidation="Integer" text="0" textAlignment="MiddleCenter" onEndEdit="UpdateScore" />
      <Button id="BI_S1P1" class="PMButton" onClick="IncrementScore" />
    </Cell>
  --]]
  for player = 1, ColumnsAdded do
    local ButtonDecrement = {
      ["tag"]         = "Button",
      ["attributes"]    = {
        ["id"]          = "BD_S".. RowsAdded .."P".. player,
        ["class"]       = "PMButton",
        ["onClick"]     = "DecrementScore",
        ["text"]        = "-"}
      }
    local InputField = {
      ["tag"]         = "InputField",
      ["attributes"]    = {
        ["id"]                  = "I_S".. RowsAdded .."P".. player,
        ["class"]               = "UIInputField",
        ["characterValidation"] = "Integer",
        ["text"]                = "0",
        ["textAlignment"]       = "MiddleCenter",
        ["onEndEdit"]           = "UpdateScore"}
      }
    local ButtonIncrement = {
      ["tag"]         = "Button",
      ["attributes"]    = {
        ["id"]          = "BI_S".. RowsAdded .."P".. player,
        ["class"]       = "PMButton",
        ["onClick"]     = "IncrementScore",
        ["text"]        = "+"}
      }

    local Cell = {
      ["tag"]         = "Cell",
      ["children"]    = {ButtonDecrement, InputField, ButtonIncrement}
      }

    --Add Cell to ScoreRow
    table.insert(ScoreRow["children"], Cell)
  end

  --Add newly created XML elements
  --XML[2] = <Panel>, XML[2]["children"][2] = <Panel><TableLayout>
  insertPos = #XML[2]["children"][2]["children"]
  table.insert(XML[2]["children"][2]["children"], insertPos, ScoreRow)

  --Update UI
  UI.setXmlTable(XML)

  --setXmlTable takes 1 frame to update the runtime UI. This means we have to start a coroutine that will wait a frame to do any further changes.
  startLuaCoroutine(Global, "AddDelayed")
end

function AddColumn()
  ColumnsAdded = ColumnsAdded + 1

  --Adding an additional cell in the TableLayout-Header that looks like: <Cell><Text id="P1" text="Player 1" /></Cell>
  local Cell = {
    ["tag"]         = "Cell",
    ["children"]    = {{
      ["tag"]         = "Text",
      ["attributes"]  = {
        ["id"] = "P".. ColumnsAdded,
        ["text"] = "Player "..ColumnsAdded}
    }}}
    --Inserting Cell into TableLayout-Header
    --XML[2] = <Panel>, XML[2]["children"][2] = <Panel><TableLayout>
    table.insert(XML[2]["children"][2]["children"][1]["children"], Cell)

    --Add adjustedable scores entries for the new Column
    for r = 1, RowsAdded do
      local ButtonDecrement = {
        ["tag"]         = "Button",
        ["attributes"]    = {
          ["id"]          = "BD_S".. r .."P".. ColumnsAdded,
          ["class"]       = "PMButton",
          ["onClick"]     = "DecrementScore",
          ["text"]        = "-"}
        }
      local InputField = {
        ["tag"]         = "InputField",
        ["attributes"]    = {
          ["id"]                  = "I_S".. r .."P".. ColumnsAdded,
          ["class"]               = "UIInputField",
          ["characterValidation"] = "Integer",
          ["text"]                = "0",
          ["textAlignment"]       = "MiddleCenter",
          ["onEndEdit"]           = "UpdateScore"}
        }
      local ButtonIncrement = {
        ["tag"]         = "Button",
        ["attributes"]    = {
          ["id"]          = "BI_S".. r .."P".. ColumnsAdded,
          ["class"]       = "PMButton",
          ["onClick"]     = "IncrementScore",
          ["text"]        = "+"}
        }
      Cell = {
        ["tag"]         = "Cell",
        ["children"]    = {ButtonDecrement, InputField, ButtonIncrement}
        }
      table.insert(XML[2]["children"][2]["children"][r+1]["children"], Cell)
    end

    --Add TotalScore entry for the new Column
    Cell = {
      ["tag"]         = "Cell",
      ["children"]    = {{
        ["tag"]         = "Text",
        ["attributes"]  = {
          ["id"] = "TSP" .. ColumnsAdded,
          ["text"] = "0"}
      }}}
    table.insert(XML[2]["children"][2]["children"][RowsAdded+2]["children"], Cell)

  --Update UI
  UI.setXmlTable(XML)

  --setXmlTable takes 1 frame to update the runtime UI. This means we have to start a coroutine that will wait a frame to do any further changes.
  startLuaCoroutine(Global, "AddDelayed")
end

function AddDelayed()
  --Wait 1 Frame
  coroutine.yield(0)

  --Adjust Layout: Move "+-Button"
  UI.setAttribute("FAB_AddRow", "offsetXY", "11 " .. (-86 - RowsAdded * 50))

  --Adjust Layout: Increase Window width
  UI.setAttribute("ScoreSheetPanel", "width", 150 * (ColumnsAdded + 1) + 85)
  UI.setAttribute("MenuBar", "width", 150 * (ColumnsAdded + 1) + 85)

  --Adjust Layout: Increase Table width
  UI.setAttribute("ScoreTable", "width", 150 * (ColumnsAdded + 1))

  --Adjust Layout: Increase Table height
  UI.setAttribute("ScoreTable", "height", 100 + RowsAdded * 50)

  --Adjust Layout: Increase Window height
  if RowsAdded > 6 then
    UI.setAttribute("ScoreSheetPanel", "height", 475 + (RowsAdded - 6) * 50)
  end

  --Set Values
  startLuaCoroutine(Global, "ScoreSheetSetup")

  return 1
end

function SetColumnColors()
  for i, v in ipairs(getSeatedPlayers()) do
    for j = 1, RowsAdded + 2 do
      local id = "P"..i
      UI.setAttribute(id, "color", v)
      UI.setAttribute(id, "text", v)
      UI.setAttribute(id, "outline", "#000000")
    end
  end
end

function tableCullNumericIndexes(t)
    for i in pairs(t) do
        if type(i) == "number" then
            table.remove(t, i)
            return tableCullNumericIndexes(t)
        end
    end
    return t
end