local ReplicatedStorage =  game:GetService("ReplicatedStorage")
local RobloxBoardGameServer = script.Parent.Parent.RobloxBoardGameServer
local ServerStartUp = require(RobloxBoardGameServer.StartupFiles.ServerStartUp)
local GameDetailsDeclaration = require(ReplicatedStorage.SFBGShared.GameDetailsDeclaration)

local SFBGServer = script.Parent
local GameInstanceFunctionsDeclaration = require(SFBGServer.GameInstanceFunctionsDeclaration)

assert(GameDetailsDeclaration.gameDetailsByGameId ~= nil, ", GameDetailsDeclaration.gameDetailsByGameId is nil")
assert(GameInstanceFunctionsDeclaration.gameInstanceFunctionsByGameId ~= nil, "GameDetailsDeclaration.gameDetailsByGameId is nil")


ServerStartUp.ServerStartUp(GameDetailsDeclaration.gameDetailsByGameId,
    GameInstanceFunctionsDeclaration.gameInstanceFunctionsByGameId)
