local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RobloxBoardGameShared = ReplicatedStorage.RobloxBoardGameShared
local CommonTypes = require(RobloxBoardGameShared.Types.CommonTypes)  

local nutsGameId = 1
local nutsGameDetails: CommonTypes.GameDetails = {
    gameId = 1, 
    gameImage = 17571483456,
    name = "Nuts", 
    description = "A cooperative puzzle game where players work together to configure a factory floor to ship nuts.",
    minPlayers = 2,
    maxPlayers = 5,
}

local GameDetails: CommonTypes.GameDetails = {
    [nutsGameId] = nutsGameDetails,
}

return GameDetails