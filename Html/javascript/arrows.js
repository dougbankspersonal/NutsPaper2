define([
	'javascript/gameUtils',
	'dojo/dom-style',
	'dojo/domReady!'
], function(gameUtils, domStyle){

	var arrowTypes = {
		LeftArrow: "LeftArrow",
		RightArrow: "RightArrow",
		DoubleArrow: "DoubleArrow",
	}

    var leftPx = gameUtils.slotWidth - gameUtils.arrowWidth/2
    var topPx = gameUtils.standardRowHeight/2 - gameUtils.arrowHeight/2

    var imagesByType = {}
	imagesByType[arrowTypes.LeftArrow] = "images/Arrows/LeftArrow.png"
	imagesByType[arrowTypes.RightArrow] = "images/Arrows/RightArrow.png"
	imagesByType[arrowTypes.DoubleArrow] = "images/Arrows/DoubleArrow.png"

	function addArrow(rowIndex, columnIndex, arrowType) {
		var classArray = ["arrow"]
        var slot = gameUtils.getSlot(rowIndex, columnIndex)
		var node = gameUtils.addDiv(slot, classArray, "arrow.".concat(arrowType))
		domStyle.set(node, {
			"z-index": `${gameUtils.arrowZIndex}`,
            "left": `${leftPx}px`,
            "top": `${topPx}px`,
			"width": `${gameUtils.arrowWidth}px`,
			"height": `${gameUtils.arrowHeight}px`,
        })

		var image = imagesByType[arrowType]
        gameUtils.addImage(node, ["image"], "image", image)

        return node
	}

    return {
		arrowTypes: arrowTypes,
		addArrow: addArrow,
    };
});