local ReplicatedStorage =  game:GetService("ReplicatedStorage")
local ServerStartUp = require(ReplicatedStorage.RobloxBoardGame.ServerStartUp)
local RBGConfig = require(ReplicatedStorage.Nuts.RBGConfig)

ServerStartUp.StartUp(RBGConfig)

