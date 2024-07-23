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

local mockGameId = GameDetailsDeclaration.nutsGameId + 100
local function addMockGame()
    local gameId = mockGameId
    mockGameId = mockGameId + 1
    local mockGameDetails = {
        gameId = mockGameId,
        name = "Mock Game " .. gameId,
        description = "This is a mock game",
        minPlayers = 2,
        maxPlayers = 3,
    }
    gameDetailsByGameId[gameId] = mockGameDetails
end

GameDetailsDeclaration.addMockGames = function()
    for _ = 1, 10 do
        addMockGame()
    end
end

GameDetailsDeclaration.getGameDetailsByGameId = function(): CommonTypes.GameDetailsByGameId
    return gameDetailsByGameId
end

return GameDetailsDeclaration