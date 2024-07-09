local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameDetailsDeclaration = require(ReplicatedStorage.SFBGShared.GameDetailsDeclaration)

local RobloxBoardGameClient = script.Parent.Parent.RobloxBoardGameClient
local ClientStartUp = require(RobloxBoardGameClient.StartupFiles.ClientStartUp)

local SFBGClient = script.Parent
local GameUIsDeclaration = require(SFBGClient.GameUIsDeclaration)

local screenGui = script.Parent.Parent

assert(screenGui:IsA("ScreenGui"), "screenGui should exist and be a screenGui")

ClientStartUp.ClientStartUp(screenGui, GameDetailsDeclaration.gameDetailsByGameId, GameUIsDeclaration.gameUIsByGameId)
