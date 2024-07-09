--[[
A static table describing server-side functions for each game in the experience.
Passed into ServerStartUp.ServerStartUp from RobloxBoardGame.
There must be a 1-1 mapping between elements in this table and the games in GameDetailsDeclaration.lua.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RobloxBoardGameShared = ReplicatedStorage.RobloxBoardGameShared
local CommonTypes = require(RobloxBoardGameShared.Types.CommonTypes)
local GameDetailsDeclaration = require(ReplicatedStorage.SFBGShared.GameDetailsDeclaration)

local GameUIsDeclaration = {} 

local nutsGameUIs: CommonTypes.GameUIs = {
    -- FIXME(dbanks) resolve and add functions needed here.
    setupUI = function()
        assert(false, "FIXME(dbanks) Implement nutsGameUIs.setupUI")
    end,
}

GameUIsDeclaration.gameUIsByGameId = {
    [GameDetailsDeclaration.nutsGameId] = nutsGameUIs,
} :: CommonTypes.GameUIsByGameId

return GameUIsDeclaration
