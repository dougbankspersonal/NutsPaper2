--[[
Generic debug logging.
Calling is convoluted:

Add this to your file:
local getDebugLog = function()
  if not debugLog then
    debugLog = Global.call("getDebugLog")
  end
  return debugLog
end


Then call:
getDebugLog().call("debugLog", {
  tag = "GameSetup",
  massage = "Doug: called makeCardsInDeckNotInHand"
})
]]
local debugTags = {
  GameSetup = true,
}

function debugLog(params)
  local tag = params.tag
  local massage = params.massage

  if not debugTags[tag] then
    return
  end

  print(tag .. ":", massage)
end