local screenGui = script.Parent
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ClientStartUp = require(ReplicatedStorage.RobloxBoardGame.ClientStartUp)
local RBGConfig = require(ReplicatedStorage.Nuts.RBGConfig)

ClientStartUp.StartUp(screenGui, RBGConfig)
