--[[

local ReplicatedStorage = game:GetService("ReplicatedStorage")
-- using wally package
--local GameAnalytics = require(ReplicatedStorage.Packages.GameAnalytics)
-- using rojo or manually copied in
local GameAnalytics = require(ReplicatedStorage.GameAnalytics)

local player = game.Players.LocalPlayer

local function getCustomUserId()
    return player.DisplayName
end

print("Doug: client GameAnalytics = ", GameAnalytics)

GameAnalytics:initClient()
]]