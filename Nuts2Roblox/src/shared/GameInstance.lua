-- The Game Instance for Nuts.
-- When the RobloxBoardGame table starts playing, this instance is created on the server, it needs to drive 
-- everthing that happens in the game.
local NutsGameInstance = {}

NutsGameInstance.__index = NutsGameInstance

function NutsGameInstance.new(tableId)
	local nutsGameInstance = {}
	setmetatable(nutsGameInstance, NutsGameInstance)
	
	nutsGameInstance.tableId = tableId

	return nutsGameInstance
end

return NutsGameInstance