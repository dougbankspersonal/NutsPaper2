local nutsGameId = "nutsGameId"
local nutsGameDetails = {
    name = "Nuts", 
    minPlayers = 2,
    maxPlayers = 5,
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