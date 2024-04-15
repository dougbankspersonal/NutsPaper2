define([
    'dojo/dom',
	'dojo/dom-construct',
	'dojo/dom-attr',
	'dojo/dom-style',
	'javascript/gameUtils',
	'dojo/domReady!'
], function(dom, domConstruct, domAttr, domStyle, gameUtils){

	var beltSegmentZIndex = 0
	var rowZUIndex = 0

	var standardRowHeight = 160;
	var ordersRowHeight = gameUtils.cardHeight + 20;
	var numbersRowHeight = 100;

	var elementHeight = standardRowHeight - 4

	var slotWidth = 240;
	var horizontalSpaceBetweenSlots = 10;

	// Visual aid for all this:
	// Total width of slot:
	// +-a-+-----b-----+-a-+
	// Where a is horizontalSpaceBetweenSlots/2 and b slotWidth.
	var totalSlotWidth = slotWidth + horizontalSpaceBetweenSlots
	var crossTileVerticalInset = 5
	var crossTileHorizontalInset = 10

	// For a cross tile, it lays across two side by side slots:
	//
	// Slots: +-a-+-----b-----+-a-+-a-+-----b-----+-a-+
	// Tile : +--g--+-------------h-------------+--g--+
	// Where h is crossTileWidth and g is crossTileHorizontalInset.
	// So...
	var crossTileWidth = totalSlotWidth * 2 - 2 * crossTileHorizontalInset
	var crossTileHeight = standardRowHeight - 2 * crossTileVerticalInset

	// A belt comes in the middle of a slot:
	// So from far left that's a + b/2
	// From the Tile's left edge, call that x.
	// Then x + g = a + b/2.
	// x = a + b/2 - g
	// = horizontalSpaceBetweenSlots/2 + slotWidth/2 - crossTileHorizontalInset
	var beltCenterOffsetInTile = horizontalSpaceBetweenSlots/2 + slotWidth/2 - crossTileHorizontalInset

	var beltSegmentsPerRow = 8;
	var beltSegmentOffset = standardRowHeight/beltSegmentsPerRow
	var beltSegmentHeight = beltSegmentOffset + 2
	var beltSegmentWidth = 40

	// Add a standard width cell.  May be extra long for cards, depends on class.
	function addSlot(parent, classes, id)
	{
		var slot = gameUtils.addDiv(parent, classes + " slot", id)
		domStyle.set(slot, {
			"width": `${slotWidth}px`,
			"margin-left": `${horizontalSpaceBetweenSlots/2}`,
			"margin-right": `${horizontalSpaceBetweenSlots/2}`,
		})
		return slot
	}

	// Add a sideBar to the row with labels & whatnot.
	function addSidebar(parent, sideBarInfo) {
		var sideBar = gameUtils.addDiv(parent, "sideBar", "sideBar")
		var wrapper = gameUtils.addDiv(sideBar, "wrapper", "wrapper")
		gameUtils.addDiv(wrapper, "title", "title", sideBarInfo.title)
		if (sideBarInfo.instructions)
		{
			gameUtils.addDiv(wrapper, "instructions", "instructions", sideBarInfo.instructions)
		}

		return sideBar
	}


	// Add a row: side bar plus content.
	function addRow(parent, classes, opt_configs) {

		var unusable = opt_configs && opt_configs.unusable ? true : false
		var sideBarInfo = opt_configs && opt_configs.sideBarInfo? opt_configs.sideBarInfo : null
		var customHeight = opt_configs && opt_configs.customHeight? opt_configs.customHeight : null

		var row = gameUtils.addDiv(parent, "row " + classes, "row")

		var finalHeight = customHeight ? customHeight : standardRowHeight
		var finalZIndex = rowZUIndex
		rowZUIndex--

		domStyle.set(row, {
			"height":`${finalHeight}px`,
			"z-index":`${finalZIndex}`,
		})

		if (sideBarInfo) {
			addSidebar(row, sideBarInfo)
		}

		if (unusable) {
			gameUtils.addDiv(row, 'unusable', 'unusable')
		}

		var content = addContent(row)

		return row, content
	}

	function addContent(parent) {
		var content = gameUtils.addDiv(parent, "content", "content")
		return content
	}

	function addBeltSegment(parent, xOffset, yOffset, opt_rads) {
		var beltSegment = gameUtils.addDiv(parent, "beltSegment", "beltSegment")
		var style = {
			"left": `${xOffset}px`,
			"top": `${yOffset}px`,
			"z-index": beltSegmentZIndex,
			"height": `${beltSegmentHeight}px`,
			"width": `${beltSegmentWidth}px`,
		}
		if (opt_rads != null) {
			style["transform"] = `translate(-50%, -50%	) rotate(${opt_rads}rad)`
		}

		domStyle.set(beltSegment, style)
		beltSegmentZIndex--
		return beltSegment
	}

	function addStraightBelt(parent, opt_hideTop) {
		var belt = gameUtils.addDiv(parent, "belt", "belt")

		for (let i = 0; i < beltSegmentsPerRow; i++) {
			if (opt_hideTop && i < beltSegmentsPerRow/2) {
				continue;
			}
			var yOffset = beltSegmentOffset/2 + i * beltSegmentOffset
			addBeltSegment(belt, slotWidth/2, yOffset)
		}

		return belt
	}

	function addElement(parent, opt_customClasses) {
		var classes = "element"
		if (opt_customClasses) {
			classes = classes + " " + opt_customClasses
		}
		var element = gameUtils.addDiv(parent, classes, "element")

		if (!opt_customClasses) {
			domStyle.set(element, {
				"width": `${elementHeight}px`,
				"height": `${elementHeight}px`,
			})
		}
		return element
	}

	function addStandardSlot(parent) {
		return addSlot(parent, "standard", "standardSlot")
	}

	var elementNumber = 0
	function addStandardSlotWithElementAndBelt(parent, opt_configs) {
		var hideBeltTop = opt_configs && opt_configs.hideBeltTop ? true : false
		var useNumbers = opt_configs && opt_configs.useNumbers ? true : false
		var customClasses = opt_configs && opt_configs.customClasses ? opt_configs.customClasses : null
		var tweakElement = opt_configs && opt_configs.tweakElement ? opt_configs.tweakElement : null
		var standardSlot = addStandardSlot(parent)

		if (useNumbers) {
			elementNumber++;
			var number = gameUtils.addDiv(standardSlot, "number", "number", elementNumber)
			domStyle.set(number, {
				"width": `${elementHeight}px`,
				"height": `${elementHeight}px`,
			})
		} else {
			var element = addElement(standardSlot, customClasses)
			addStraightBelt(standardSlot, hideBeltTop)
			if (tweakElement) {
				tweakElement(element)
			}
		}

		return standardSlot
	}

	function addStandardSlotWithBelt(parent) {
		var standardSlot = addStandardSlot(parent)

		addStraightBelt(standardSlot)

		return standardSlot
	}


	function addRowWithElements(pageNode, classes, opt_configs) {
		var row, content = addRow(pageNode, classes, opt_configs)

		addStandardSlotWithElementAndBelt(content, opt_configs)
		addStandardSlotWithElementAndBelt(content, opt_configs)
		return row
	}

	function addNumbersRow(pageNode, opt_sideBarInfo) {
		return addRowWithElements(pageNode, "numbers", {
			sideBarInfo: opt_sideBarInfo,
			useNumbers: true,
			customHeight: numbersRowHeight,
		})
	}

	function tweakCardElement(node)
	{
		domStyle.set(node, {
			"width": `${gameUtils.cardWidth}px`,
			"height": `${gameUtils.cardHeight}px`,
		})
	}

	function addOrdersRow(pageNode, opt_sideBarInfo) {
		return addRowWithElements(pageNode, "orders", {
			sideBarInfo: opt_sideBarInfo,
			unusable: true,
			customHeight: ordersRowHeight,
			customClasses: "card",
			tweakElement: tweakCardElement,
		})
	}

	function addCrossTileSpace(parent) {
		var crossTileSpace = gameUtils.addDiv(parent, `crossTileSpace`, "crossTileSpace")
		domStyle.set(crossTileSpace, {
			"width": `${crossTileWidth}px`,
			"height": `${crossTileHeight}px`,
			"top": `${crossTileVerticalInset}px`,
			"left": `${crossTileHorizontalInset}px`,
		})

		return crossTileSpace
	}

	function addCrossTileContainer(parent, opt_classes) {
		var classes = opt_classes ? opt_classes : ""
		crossTileContainer = gameUtils.addDiv(parent, `crossTileContainer ${classes}`, "crossTileContainer")

		var space = addCrossTileSpace(crossTileContainer)

		return crossTileContainer
	}

	function addOffsetDoubleTileRow(pageNode, opt_configs) {
		var skipLeft = opt_configs && opt_configs.skipLeft
		var skipRight = opt_configs && opt_configs.skipRight
		var row, content = addRow(pageNode, "conveyor offset", opt_configs)

		addStandardSlotWithBelt(content)
		addStandardSlotWithBelt(content)
		if (!skipLeft) {
			addCrossTileContainer(content, "left")
		}

		if (!skipRight) {
			addCrossTileContainer(content, "right")
		}

		return row
	}

	function addDoubleTileRow(pageNode, opt_configs) {
		var row, content = addRow(pageNode, "conveyor", opt_configs)

		addStandardSlotWithBelt(content)
		addStandardSlotWithBelt(content)

		addCrossTileContainer(content)

		return row
	}

	function addLeftStripPage(bodyNode) {
		var pageNode = gameUtils.addDiv(bodyNode, "page_of_items", "page")
		conveyorRow = 1

		addNumbersRow(pageNode, true)
		addRowWithElements(pageNode, "nutDispensers", {
			sideBarInfo: {
				title: "Nut Dispensers",
				instructions: "Move a Nut Dispenser to any vacant space (you may do this twice)",
			},
			hideBeltTop: true,
		})
		addDoubleTileRow(pageNode, {
			sideBarInfo: {
				title: `Cross Tiles #${conveyorRow++}`,
				instructions: "Add or remove a Cross Tile",
			},
		})
		addRowWithElements(pageNode, "squirrels", {
			sideBarInfo: {
				title: "Squirrels",
				instructions: `
					<div class="irow wide"><div class>Pick a squirrel and roll one die:</div></div>
					<div class="irow"><div class=emoji>&#x2680;: &#x2205</div><div class=emoji>&#x2681;:  &#x2205</div></div>
					<div class="irow"><div class=emoji>&#x2683;: &#x2190</div><div class=emoji>&#x2683;: &#x2192</div></div>
					<div class="irow"><div class=emoji>&#x2685;: &#x2190 &#x2190</div><div class=emoji>&#x2685;: &#x2192 &#x2192</div></div>`,
			},
		})
		addOffsetDoubleTileRow(pageNode, {
			sideBarInfo: {
				title: `Cross Tiles #${conveyorRow++}`,
				instructions: "Add or remove a Cross Tile",
			},
			skipLeft: true,
		})
		addRowWithElements(pageNode, "roasters", {
			sideBarInfo: {
				title: "Roasters",
				instructions: "Move a Roaster to any vacant space",
			},
		})
		pageNode = gameUtils.addDiv(bodyNode, "page_of_items", "page")

		addDoubleTileRow(pageNode, {
			sideBarInfo: {
				title: `Cross Tiles #${conveyorRow++}`,
				instructions: "Add or remove a Cross Tile",
			},
		})
		addRowWithElements(pageNode, "salters", {
			sideBarInfo: {
				title: "Salters",
				instructions: "Move a Salter to any vacant space",
			},
		})
		addOffsetDoubleTileRow(pageNode, {
			sideBarInfo: {
				title: `Cross Tiles #${conveyorRow++}`,
				instructions: "Add or remove a Cross Tile",
			},
			skipLeft: true,
		})
		addOrdersRow(pageNode, {
			title: "Orders",
		})

		return pageNode
	}

	function addMiddleStripPage(bodyNode) {
		var pageNode = gameUtils.addDiv(bodyNode, "page_of_items", "page")

		addNumbersRow(pageNode)
		addRowWithElements(pageNode, "nutDispensers", {
			hideBeltTop: true,
		})
		addDoubleTileRow(pageNode)
		addRowWithElements(pageNode, "squirrels")
		addOffsetDoubleTileRow(pageNode)
		addRowWithElements(pageNode, "roasters")

		pageNode = gameUtils.addDiv(bodyNode, "page_of_items", "page")
		addDoubleTileRow(pageNode)
		addRowWithElements(pageNode, "salters")
		addOffsetDoubleTileRow(pageNode)
		addOrdersRow(pageNode)
		return pageNode
	}

	var squirrelNames = [
		"Abner",
		"Brenda",
		"Chauncy",
	]

	function addElementsPage(bodyNode) {
		var maxNumPlayers = 5
		var numDispensers = maxNumPlayers + 1
		var numSaltersAndRoasters = maxNumPlayers + 2
		var numSquirrels = 3

		var pageNode = gameUtils.addDiv(bodyNode, "page_of_items", "page")
		var elementsContainer = gameUtils.addDiv(pageNode, "elementsContainer", "elementsContainer")
		var elementDescs = [
			{
				images: [
					"images/Factory/Nut.Almond.png",
					"images/Factory/Nut.Peanut.png",
				],
				number: numDispensers * 2,
			},
			{
				image: "images/Factory/Roaster.png",
				number: numSaltersAndRoasters,
			},
			{
				image: "images/Factory/Salter.png",
				number: numSaltersAndRoasters,
			},
			{
				image: "images/Factory/Squirrel.png",
				number: numSquirrels,
				names: squirrelNames,
			},
		]

		for (elementDesc of elementDescs) {
			for (let i = 0; i < elementDesc.number; i++)
			{
				var element = addElement(elementsContainer)
				var image
				if (elementDesc.image) {
					image = elementDesc.image
				}
				else
				{
					image = elementDesc.images[i % elementDesc.images.length]
				}

				gameUtils.addImage(element, "image", "image", image)
				if (elementDesc.names) {
					gameUtils.addDiv(element, "name", "name", `${elementDesc.names[i]}`)
				}
				else
				{
					gameUtils.addDiv(element, "name", "name", `#${i+1}`)
				}
			}
		}
		return pageNode
	}

	function getCurvePoints() {
		var curvePoints = []

		var startX = beltCenterOffsetInTile
		var endX = crossTileWidth - beltCenterOffsetInTile

		var startY = 0
		var endY = crossTileHeight
		var middleX = (startX + endX)/2
		var middleY = (startY + endY)/2

		var offsetWhileTurning = beltSegmentHeight/2

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
		var numSegments = Math.ceil(distanceToMiddle/beltSegmentHeight)
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
				xOffset: crossTileWidth - oldPoint.xOffset,
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

	function addCrossTile(parent) {
		var crossTile = gameUtils.addDiv(parent, `crossTile`, "crossTile")
		domStyle.set(crossTile, {
			"width": `${crossTileWidth}px`,
			"height": `${crossTileHeight}px`,
		})

		// Add belts.
		// Left to right belt.
		for (let index = 0; index < curvePoints.length; index++) {
			var curvePoint = curvePoints[index]
			addBeltSegment(crossTile, curvePoint.xOffset, curvePoint.yOffset, curvePoint.rads)
		}

		// Right to left belt.
		for (let index = 0; index < curvePoints.length; index++) {
			var curvePoint = curvePoints[index]
			addBeltSegment(crossTile, crossTileWidth - curvePoint.xOffset, curvePoint.yOffset, -curvePoint.rads)
		}

		return crossTile
	}

	function addCrossTilesPage(bodyNode) {
		var pageNode = gameUtils.addDiv(bodyNode, "page_of_items", "page")

		// Max 5 players.
		// (NumPlayers + 1) * 2 columns.
		// 2 normal rows, 2 offset rows.
		// Normal Row = 1 tile every 2 colums.
		// Offset Row = 1 tile every 2 columns, then minus one.
		// Plus some slop.
		var numPlayers = 5
		var numColumns = (numPlayers + 1) * 2
		var numNormalRows = 2
		var numOffsetRows = 2
		var numTilesForNormalRows = (numColumns/2) * numNormalRows
		var numTilesForOffsetRows = (numColumns/2 - 1) * numOffsetRows
		var slop = 2
		var totalNumTiles = numTilesForOffsetRows + numTilesForNormalRows + slop

		for (let i = 0; i < totalNumTiles; i++) {
			addCrossTile(pageNode)
		}

		return pageNode
	}

	// This returned object becomes the defined value of this module
    return {
        create: function () {
            var bodyNode = dom.byId("body");

			// Re-printing: cross tiles are fine, comment out.
			// addCrossTilesPage(bodyNode)
			addElementsPage(bodyNode)

			addLeftStripPage(bodyNode)
			addMiddleStripPage(bodyNode)
			addMiddleStripPage(bodyNode)
			addMiddleStripPage(bodyNode)
			addMiddleStripPage(bodyNode)
			addMiddleStripPage(bodyNode)
        },
    };
});