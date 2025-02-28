local bounds = self.getBoundsNormalized()
local sizeVector = bounds.size
local sizeY = sizeVector.y

local moveCardTimeSec = 0.5

local nutTableColumnWidth = 0.167
local nutTableRowHeight = 0.178
local nutTableZOffset = -0.52
local nutTableXOffset = -0.5

local nutTableDesc = {
    numColumns = 6,
    numRows = 4,
    columnWidth = nutTableColumnWidth,
    rowHeight = nutTableRowHeight,
    xOffset = nutTableXOffset,
    zOffset = nutTableZOffset,
}

local bottomCellColumnWidth = 0.2
local bottomCellRowHeight = 0.16
local bottomCellXOffset = -0.5
local bottomCellZOffset = 0.22

local otherTableWiggle = -0.02

local otherTableDesc = {
    numColumns = 6,
    numRows = 2,
    columnWidth = bottomCellColumnWidth,
    rowHeight = bottomCellRowHeight,
    xOffset = bottomCellXOffset,
    zOffset = bottomCellZOffset,
    wiggleFunction = function(_, column)
        if column % 2 == 0 then
            return {
                x = otherTableWiggle,
                z = 0,
            }
        else
            return {
                x = -otherTableWiggle,
                z = 0,
            }
        end
    end
}

local snapPoints = {}

local function addSnapPoints(nutTableDesc, tag)
    for i = 1, nutTableDesc.numColumns do
        for j = 1, nutTableDesc.numRows do
            local wiggle = {x = 0, z = 0}
            if nutTableDesc.wiggleFunction then
                wiggle = nutTableDesc.wiggleFunction(j, i)
            end
            local snapX = wiggle.x + nutTableDesc.xOffset + nutTableDesc.columnWidth * (i-1)
            local snapY = sizeY
            local snapZ = wiggle.z + nutTableDesc.zOffset + nutTableDesc.rowHeight * (j-1)
            local snapPoint = {
                position = {snapX, snapY, snapZ},
                tags = {tag},
                rotation = {0, 0, 0},
                rotation_snap = true,
            }
            table.insert(snapPoints, snapPoint)
        end
    end
end

local function moveCardPrototype(theCard)
    Global.call("movePrototype", {
        obj = theCard,
        guid = cardId,
    })
end

--[[
-- TTS system calls.
]]
--[[
function onLoad()
    -- If this is the source score card, move it out of the way.
    bounds = self.getBoundsNormalized()
    sizeVector = bounds.size
    sizeY = sizeVector.y

    addSnapPoints(nutTableDesc, "nutTable")
    addSnapPoints(otherTableDesc, "otherTable")

    self.setSnapPoints(snapPoints)

    Wait.time(function() moveCardPrototype(self) end, moveCardTimeSec)

end
]]
