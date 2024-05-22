local ReplicatedStorage = game:GetService("ReplicatedStorage")
local CommonTypes = require(ReplicatedStorage.CommonTypes)  
local GameInstance = require(ReplicatedStorage.GameInstance)

local nutsGameId = 1
local nutsGameDetails: CommonTypes.GameDetails = {
    gameId = 1, 
    gameImage = 17571483456,
    name = "Nuts", 
    description = "A cooperative puzzle game where players work together to configure a factory floor to ship nuts.",
    minPlayers = 2,
    maxPlayers = 5,
    makeGameInstance = function(tableId: CommonTypes.TableId) -> any
        return GameInstance.new(tableId)
    end 
}

local mockGameId = "mockGameId"
local mockGameDetails = {
    name = "Mock Game", 
    minPlayers = 2,
    maxPlayers = 4,
}

local RBGConfig = {
    gameDetailsList = {
        [nutsGameId] = nutsGameDetails,
        [mockGameId] = mockGameDetails,
    }
}

return RBGConfig