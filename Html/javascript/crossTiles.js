define([
    'dojo/dom',
	'dojo/dom-style',
	'javascript/beltUtils',
	'javascript/gameUtils',
	'dojo/domReady!'
], function(dom, domStyle, beltUtils, gameUtils){
	function getCurvePoints() {
		var curvePoints = []

		var startX = gameUtils.beltCenterOffsetInTile
		var endX = gameUtils.crossTileInnerWidth - gameUtils.beltCenterOffsetInTile

		var startY = 0
		var endY = gameUtils.crossTileHeight
		var middleX = (startX + endX)/2
		var middleY = (startY + endY)/2

		var offsetWhileTurning = gameUtils.beltSegmentHeight/2

		var lastX = startX
		var lastY = startY
		curvePoints.push({
			xOffset: lastX,
			yOffset: lastY,
		})
		// Down a step.
		lastX = lastX
		lastY = lastY + offsetWhileTurning
		curvePoints.push({
			xOffset: lastX,
			yOffset: lastY,
		})
		// Down and over a bit, equal measures.
		lastX = lastX + Math.sqrt(2) * offsetWhileTurning/2
		lastY = lastY + Math.sqrt(2) * offsetWhileTurning/2
		curvePoints.push({
			xOffset: lastX,
			yOffset: lastY,
		})

		// Now over to the middle.
		var distanceToMiddle = Math.sqrt((lastX - middleX)**2 + (lastY - middleY)**2)
		var numSegments = Math.ceil(distanceToMiddle/gameUtils.beltSegmentHeight)
		var xDelta = (middleX-lastX)/numSegments
		var yDelta = (middleY-lastY)/numSegments
		for (let i = 0; i < numSegments; i++) {
			lastX = lastX + xDelta
			lastY = lastY + yDelta
			curvePoints.push({
				xOffset: lastX,
				yOffset: lastY,
			})
		}

		// Now back out...
		var startIndex = curvePoints.length-1
		for (let i = startIndex; i--; i >= 0)
		{
			var oldPoint = curvePoints[i]
			curvePoints.push({
				xOffset: gameUtils.crossTileInnerWidth - oldPoint.xOffset,
				yOffset: endY - oldPoint.yOffset,
			})
		}

		// Throw in angles.
		for (let index = 0; index < curvePoints.length; index++) {
			var prevCurvePoint = null
			var nextCurvePoint = null
			var thisCurvePoint = curvePoints[index]
			if (index > 0) {
				prevCurvePoint = curvePoints[index - 1]
			}

			if (index < curvePoints.length - 1) {
				nextCurvePoint = curvePoints[index + 1]
			}

			thisCurvePoint.rads = 0
			if (prevCurvePoint != null && nextCurvePoint != null) {
				var xDelta = nextCurvePoint.xOffset - prevCurvePoint.xOffset
				var yDelta = nextCurvePoint.yOffset - prevCurvePoint.yOffset
				thisCurvePoint.rads = Math.PI/2 + Math.atan2(yDelta, xDelta)
			}
		}

		return curvePoints
	}

	var curvePoints = getCurvePoints()

	function addCrossTile(parentNode, crossTileId, opt_classArray) {
		var classArray = gameUtils.extendOptClassArray(opt_classArray, "crossTile")
		if (gameUtils.getIsDemoBoard()) {
			classArray.push("isDemoBoard")
		}
		var crossTile = gameUtils.addDiv(parentNode, classArray, crossTileId)
		domStyle.set(crossTile, {
			"width": `${gameUtils.crossTileWidth}px`,
			"height": `${gameUtils.crossTileHeight}px`,
			"border": `${gameUtils.crossTileBorder}px solid #000000`
		})

		// Add belts.
		// Left to right belt.
		var belt = gameUtils.addDiv(crossTile, ["belt", "left"], "leftBelt")
		for (let index = 0; index < curvePoints.length; index++) {
			var curvePoint = curvePoints[index]
			beltUtils.addBeltSegment(belt, curvePoint.xOffset, curvePoint.yOffset, curvePoint.rads)
		}

		// Right to left belt.
		belt = gameUtils.addDiv(crossTile, ["belt", , "right"], "rightBelt")
		for (let index = 0; index < curvePoints.length; index++) {
			var curvePoint = curvePoints[index]
			beltUtils.addBeltSegment(belt, gameUtils.crossTileInnerWidth - curvePoint.xOffset, curvePoint.yOffset, -curvePoint.rads)
		}

		return crossTile
	}

	function addCrossTilesPage(bodyNode, numCrossTiles) {
		var pageNode = gameUtils.addPageOfItems(bodyNode)

		for (let i = 0; i < numCrossTiles; i++) {
			addCrossTile(pageNode)
		}

		return pageNode
	}

	function createCrossTiles(totalNumCrossTiles) {
		var bodyNode = dom.byId("body");
		var stripsPerPage = 12
		var numPages = Math.ceil(totalNumCrossTiles/stripsPerPage)
		for (i = 0; i < numPages; i++) {
			var numStrips = Math.min(stripsPerPage, totalNumCrossTiles - i * stripsPerPage)
			addCrossTilesPage(bodyNode, numStrips)
		}
	}

	// This returned object becomes the defined value of this module
    return {
		createCrossTiles: createCrossTiles,
		addCrossTile: addCrossTile,
    };
});