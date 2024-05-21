--[[
    
local ReplicatedStorage = game:GetService("ReplicatedStorage")
-- using wally package
--local GameAnalytics = require(ReplicatedStorage.Packages.GameAnalytics)
-- using rojo or manually copied in
local GameAnalytics = require(ReplicatedStorage.GameAnalytics)

GameAnalytics:configureBuild("0.0.0")

GameAnalytics:setEnabledInfoLog(true)
GameAnalytics:setEnabledVerboseLog(true)

GameAnalytics:initServer("4d63aaafed7246a509eb983aad41ad96", "0735b711086a7f07fc95c3904874d3fcaef31bc9")

print("Doug server GameAnalytics = ", GameAnalytics)

]]