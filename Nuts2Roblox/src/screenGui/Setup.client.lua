local screenGui = script.Parent.Parent
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local RobloxBoardGameClient = script.Parent.Parent.RobloxBoardGameClient
local ClientStartUp = require(RobloxBoardGameClient.StartupFiles.ClientStartUp)
local GameDetailsDeclaration = require(ReplicatedStorage.Nuts.GameDetailsDeclaration)

assert(screenGui:IsA("ScreenGui"), "screenGui should exist and be a screenGui")

ClientStartUp.StartUp(screenGui, GameDetailsDeclaration)
