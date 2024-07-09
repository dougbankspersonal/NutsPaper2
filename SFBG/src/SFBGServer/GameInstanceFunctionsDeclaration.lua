--[[
A static table describing server-side functions for each game in the experience.
Passed into ServerStartUp.ServerStartUp from RobloxBoardGame.
There must be a 1-1 mapping between elements in this table and the games in GameDetailsDeclaration.lua.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RobloxBoardGameShared = ReplicatedStorage.RobloxBoardGameShared
local CommonTypes = require(RobloxBoardGameShared.Types.CommonTypes)  
local GameDetailsDeclaration = require(ReplicatedStorage.SFBGShared.GameDetailsDeclaration)

local GameInstanceFunctionsDeclaration = {}

local nutsGameInstanceFunctions: CommonTypes.GameInstanceFunctions = {
    onPlay = function()
        assert(false, "FIXME(dbanks) Implement nutsGameInstanceFunctions.onPlay")
    end,
    onEnd = function()
        assert(false, "FIXME(dbanks) Implement nutsGameInstanceFunctions.onEnd")
    end,
    onPlayerLeft = function(userId: CommonTypes.UserId)
        assert(false, "FIXME(dbanks) Implement nutsGameInstanc.onPlayerLeft")
    end,
}

GameInstanceFunctionsDeclaration.gameInstanceFunctionsByGameId = {
    [GameDetailsDeclaration.nutsGameId] = nutsGameInstanceFunctions,
} :: CommonTypes.GameInstanceFunctionsByGameId

return GameInstanceFunctionsDeclaration
