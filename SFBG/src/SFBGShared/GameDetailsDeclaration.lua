local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RobloxBoardGameShared = ReplicatedStorage.RobloxBoardGameShared
local CommonTypes = require(RobloxBoardGameShared.Types.CommonTypes)  

local GameDetailsDeclaration = {}

GameDetailsDeclaration.nutsGameId = 1

local nutsGameDetails: CommonTypes.GameDetails = {
    gameId = GameDetailsDeclaration.nutsGameId, 
    gameImage = 17571483456,
    name = "Nuts", 
    description = "Ship nuts, and watch out for that squirrel!.",
    minPlayers = 2,
    maxPlayers = 5,
}

local gameDetailsByGameId: CommonTypes.GameDetailsByGameId = {
    [GameDetailsDeclaration.nutsGameId] = nutsGameDetails,
}

GameDetailsDeclaration.gameDetailsByGameId = gameDetailsByGameId

return GameDetailsDeclaration