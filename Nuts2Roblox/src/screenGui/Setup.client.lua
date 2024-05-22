local screenGui = script.Parent
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ClientStartUp = require(ReplicatedStorage.RobloxBoardGame.ClientStartUp)
local GameDetails = require(ReplicatedStorage.Nuts.GameDetails)

ClientStartUp.StartUp(screenGui, GameDetails.gameDetails)
