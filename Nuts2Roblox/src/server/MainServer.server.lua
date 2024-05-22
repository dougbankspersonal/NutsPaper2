local ReplicatedStorage =  game:GetService("ReplicatedStorage")
local ServerStartUp = require(ReplicatedStorage.RobloxBoardGame.ServerStartUp)
local GameDetails = require(ReplicatedStorage.Nuts.GameDetails)

ServerStartUp.StartUp(GameDetails.gameDetails)

