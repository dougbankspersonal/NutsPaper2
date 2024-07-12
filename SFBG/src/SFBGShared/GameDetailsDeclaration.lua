local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RobloxBoardGameShared = ReplicatedStorage.RobloxBoardGameShared
local CommonTypes = require(RobloxBoardGameShared.Types.CommonTypes)

local GameDetailsDeclaration = {}

GameDetailsDeclaration.nutsGameId = 1

local nutsGameOptions = {
    {
        name = "\"Schmoozing\" Expansion",
        optionId = 1,
        description = "Players attend may gain powerful advantages by bribing the right people.",
    },
    {
        name = "\"Aggressive Squirrel\" Variant",
        optionId = 2,
        description = "The Squirrel is more likely to Hunt and Scamper.",
    },
} :: CommonTypes.GameOptions

local nutsGameDetails: CommonTypes.GameDetails = {
    gameId = GameDetailsDeclaration.nutsGameId,
    gameImage = 17571483456,
    name = "Nuts",
    description = "Ship nuts, and watch out for that squirrel!.",
    minPlayers = 2,
    maxPlayers = 5,
    gameOptions = nutsGameOptions,
}

local gameDetailsByGameId: CommonTypes.GameDetailsByGameId = {
    [GameDetailsDeclaration.nutsGameId] = nutsGameDetails,
}

GameDetailsDeclaration.gameDetailsByGameId = gameDetailsByGameId

return GameDetailsDeclaration