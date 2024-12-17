local tokenId = "442fb4"

local function moveTokenPrototype(theToken)
    Global.call("movePrototype", {
        obj = theToken,
        guid = tokenId,
    })
end

-- If this is the source score card, move it out of the way.
function onLoad()
    Wait.frames(function() moveTokenPrototype(self) end, 2)
end
