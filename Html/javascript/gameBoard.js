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

	var standardRowHeight = 140;
	// var ordersRowHeight = gameUtils.cardHeight + 20;

	var slotWidth = 240;
	var horizontalSpaceBetweenSlots = 10;

	// 1 column for labels.
	var numLabelColumns = 1
	// 4 columns for each nut type.
	var columnsPerNutType = 4
	// Total:
	// * 3 for peanut/almond, * 4 for peanut/almont/walnut/pistachio
	var totalNumColumns = numLabelColumns + columnsPerNutType * 4

	// Visual aid for all this:
	// Total width of slot:
	// +-a-+-----b-----+-a-+
	// Where a is horizontalSpaceBetweenSlots/2 and b slotWidth.
	var totalSlotWidth = slotWidth + horizontalSpaceBetweenSlots
	var crossTileVerticalInset = 10
	var crossTileHorizontalInset = 20

	var RowType_NumberRow = 1
	var RowType_DispenserRow = 2
	var RowType_ConveyorRow = 3
	var RowType_SquirrelRow = 4
	var RowType_RoasterRow = 5
	var RowType_SalterRow = 6
	var RowType_OrdersRow = 7

	var rowTypesForV003 = [
		RowType_NumberRow,
		RowType_DispenserRow,
		RowType_ConveyorRow,
		RowType_SquirrelRow,
		RowType_ConveyorRow,
		RowType_RoasterRow,
		RowType_ConveyorRow,
		RowType_SalterRow,
		RowType_ConveyorRow,
		RowType_OrdersRow,
	]

	var rowTypesForV004 = [
		RowType_NumberRow,
		RowType_DispenserRow,
		RowType_ConveyorRow,
		RowType_ConveyorRow,
		RowType_ConveyorRow,
		RowType_SquirrelRow,
		RowType_ConveyorRow,
		RowType_ConveyorRow,
		RowType_ConveyorRow,
		RowType_OrdersRow,
]

	var rowTypesByVersion = {
		v003: rowTypesForV003,
		v004: rowTypesForV004,
	}

	var maxRowsPerPage = 5

	// For a cross tile, it lays across two side by side slots:
	//
	// Slots: +-a-+-----b-----+-a-+-a-+-----b-----+-a-+
	// Tile : +--g--+-------------h-------------+--g--+
	// Where h is crossTileWidth and g is crossTileHorizontalInset.
	// So...
	var crossTileWidth = totalSlotWidth * 2 - 2 * crossTileHorizontalInset
	var crossTileHeight = standardRowHeight - 2 * crossTileVerticalInset

	var elementHeight = standardRowHeight - 20

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
	function addSlot(parentNode, classes, id)
	{
		var slot = gameUtils.addDiv(parentNode, classes + " slot", id)
		domStyle.set(slot, {
			"width": `${slotWidth}px`,
			"margin-left": `${horizontalSpaceBetweenSlots/2}`,
			"margin-right": `${horizontalSpaceBetweenSlots/2}`,
		})
		return slot
	}

	// Add a sideBar to the row with labels & whatnot.
	function addSidebar(parentNode, sideBarInfo) {
		var sideBar = gameUtils.addDiv(parentNode, "sideBar", "sideBar")
		var wrapper = gameUtils.addDiv(sideBar, "wrapper", "wrapper")
		gameUtils.addDiv(wrapper, "title", "title", sideBarInfo.title)
		if (sideBarInfo.subtitle) {
			gameUtils.addDiv(wrapper, "subtitle", "subtitle", sideBarInfo.subtitle)
		}
		if (sideBarInfo.instructions)
		{
			gameUtils.addDiv(wrapper, "instructions", "instructions", sideBarInfo.instructions)
		}

		return sideBar
	}


	// Add a row: side bar plus content.
	function addRow(parentNode, version, opt_configs) {
		var darkBackground = opt_configs && opt_configs.darkBackground ? true : false
		var sideBarInfo = opt_configs && opt_configs.sideBarInfo? opt_configs.sideBarInfo : null
		var customHeight = opt_configs && opt_configs.customHeight? opt_configs.customHeight : null
		var classes = opt_configs && opt_configs.classes? opt_configs.classes : ""

		var row = gameUtils.addDiv(parentNode, "row " + version + " " + classes, "row")

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

		if (darkBackground) {
			gameUtils.addDiv(row, 'darkBackground', 'darkBackground')
		}

		var content = addContent(row)

		return row, content
	}

	function addContent(parentNode) {
		var content = gameUtils.addDiv(parentNode, "content", "content")
		return content
	}

	function addBeltSegment(parentNode, xOffset, yOffset, opt_rads) {
		var beltSegment = gameUtils.addDiv(parentNode, "beltSegment", "beltSegment")
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

	function addStraightBelt(parentNode, opt_hideTop) {
		var belt = gameUtils.addDiv(parentNode, "belt", "belt")

		for (let i = 0; i < beltSegmentsPerRow; i++) {
			if (opt_hideTop && i < beltSegmentsPerRow/2) {
				continue;
			}
			var yOffset = beltSegmentOffset/2 + i * beltSegmentOffset
			addBeltSegment(belt, slotWidth/2, yOffset)
		}

		return belt
	}

	function addElement(parentNode, opt_customClasses) {
		var classes = "element"
		if (opt_customClasses) {
			classes = classes + " " + opt_customClasses
		}
		var element = gameUtils.addDiv(parentNode, classes, "element")

		if (!opt_customClasses) {
			domStyle.set(element, {
				"width": `${elementHeight}px`,
				"height": `${elementHeight}px`,
			})
		}
		return element
	}

	function addSquirrelIndex(parentNode, squirrelIndex) {
		var squirrelIndexElement = gameUtils.addDiv(parentNode, "squirrelTitle", "squirrelTitle", "Squirrel")
		var squirrelIndexElement = gameUtils.addDiv(parentNode, "squirrelIndex", "squirrelIndex", squirrelIndex)
		return squirrelIndexElement
	}

	function addStandardSlot(parentNode) {
		return addSlot(parentNode, "standard", "standardSlot")
	}

	function addStandardSlotWithNumber(parentNode, elementNumber) {
		var standardSlot = addStandardSlot(parentNode)
		var number = gameUtils.addDiv(standardSlot, "number", "number", elementNumber)
		domStyle.set(number, {
			"width": `${elementHeight}px`,
			"height": `${elementHeight}px`,
		})
		return standardSlot
	}

	function addStandardSlotWithElementAndBelt(parentNode, opt_configs) {
		var hideBeltTop = opt_configs && opt_configs.hideBeltTop ? true : false
		var customClasses = opt_configs && opt_configs.customClasses ? opt_configs.customClasses : null
		var tweakElement = opt_configs && opt_configs.tweakElement ? opt_configs.tweakElement : null
		var skipElement = opt_configs && opt_configs.skipElement ? true : false
		var squirrelIndex = opt_configs && opt_configs.squirrelIndex ? opt_configs.squirrelIndex : null

		var standardSlot = addStandardSlot(parentNode)

		if (!skipElement) {
			var element = addElement(standardSlot, customClasses)
			if (squirrelIndex) {
				addSquirrelIndex(element, squirrelIndex)
			}
			if (tweakElement) {
				tweakElement(element)
			}
		}
		addStraightBelt(standardSlot, hideBeltTop)

		return standardSlot
	}

	function addNColumnRowWithElements(parentNode, version, numColumns, firstColumnIndex, opt_configs) {
		var row, content = addRow(parentNode, version, opt_configs)

		if (opt_configs && opt_configs.sideBarInfo) {
			numColumns = numColumns - 1
		}

		var numLeft = totalNumColumns - firstColumnIndex
		if (numColumns > numLeft) {
			numColumns = numLeft
		}

		var configs = opt_configs ? opt_configs : {}
		var squirrelStartIndex = configs.squirrelStartIndex

		var adjustment = 0
		if (firstColumnIndex != 0) {
			adjustment = -1
		}

		for (let i = 0; i < numColumns; i++) {
			var squirrelIndex
			if (squirrelStartIndex) {
				squirrelIndex = squirrelStartIndex + i + firstColumnIndex + adjustment
			}
			configs.squirrelIndex = squirrelIndex
			addStandardSlotWithElementAndBelt(content, configs)
		}
		return row
	}

	function addNColumnRowWithNumbers(parentNode, version, numColumns, firstColumnIndex, opt_configs) {
		var row, content = addRow(parentNode, version, opt_configs)

		if (opt_configs && opt_configs.sideBarInfo) {
			numColumns = numColumns - 1
			firstColumnIndex = firstColumnIndex + 1
		}

		var numLeft = totalNumColumns - firstColumnIndex
		if (numColumns > numLeft) {
			numColumns = numLeft
		}

		for (let i = 0; i < numColumns; i++) {
			var elementNumber = firstColumnIndex + i
			addStandardSlotWithNumber(content, elementNumber, opt_configs)
		}
		return row
	}

	function addNColumnRowWithConveyors(parentNode, version, numColumns, firstColumnIndex, opt_configs) {
		var row, content = addRow(parentNode, version, opt_configs)

		if (opt_configs && opt_configs.sideBarInfo) {
			numColumns = numColumns - 1
		}

		var numLeft = totalNumColumns - firstColumnIndex
		if (numColumns > numLeft) {
			numColumns = numLeft
		}

		var configs = opt_configs ? opt_configs : {}
		configs.skipElement = true
		for (let i = 0; i < numColumns; i++) {
			addStandardSlotWithElementAndBelt(content, configs)
		}
		return row
	}

	function tweakCardElement(node)	{
		domStyle.set(node, {
			"width": `${gameUtils.cardWidth}px`,
			"height": `${gameUtils.cardHeight}px`,
		})
	}

	function addNColumnOrdersRow(parentNode, version, numColumns, firstColumnIndex, opt_configs) {
		var sideBarInfo = opt_configs && opt_configs.sideBarInfo ? opt_configs.sideBarInfo : null
		return addNColumnRowWithElements(parentNode, version, numColumns, firstColumnIndex, {
			classes: "orders",
			sideBarInfo: sideBarInfo,
			darkBackground: true,
			// customHeight: ordersRowHeight,
			customClasses: "card",
			tweakElement: tweakCardElement,
		})
	}

	function addNColumnStrip(parentNode, version, factoryColumnCount, numColumns, firstColumnIndex) {
		var pageNode = gameUtils.addDiv(parentNode, "page_of_items", "page")
		var isLeft = (firstColumnIndex == 0)

		var rowTypes = rowTypesByVersion[version]

		var numSquirrelRows = 0

		var rowsThisPage = 0
		for (let i = 0; i < rowTypes.length; i++) {
			if (rowsThisPage >= maxRowsPerPage)
			{
				pageNode = gameUtils.addDiv(parentNode, "page_of_items", "page")
				rowsThisPage = 0
			}

			var rowType = rowTypes[i]
			switch (rowType) {
				case RowType_NumberRow:
					addNColumnRowWithNumbers(pageNode, version, numColumns, firstColumnIndex, {
						classes: "numbers",
						sideBarInfo: isLeft? {
							title: "",
						} : null,
					})
					break;
				case RowType_DispenserRow:
					addNColumnRowWithElements(pageNode, version, numColumns, firstColumnIndex, {
						classes: "nutDispensers",
						sideBarInfo: isLeft? {
							title: "Dispensers",
						} : null,
						hideBeltTop: true,
					})
					break;
				case RowType_ConveyorRow:
					addNColumnRowWithConveyors(pageNode, version, numColumns, firstColumnIndex, {
						classes: "nutDispensers",
						sideBarInfo: isLeft? {
							title: "Conveyor",
						} : null,
					})
					break;
				case RowType_RoasterRow:
					var squirrelRangeStart = numSquirrelRows * factoryColumnCount + 1
					var squirrelRangeEnd = (numSquirrelRows + 1) * factoryColumnCount
					var subtitle = `<i>Squirrel spaces ${squirrelRangeStart}-${squirrelRangeEnd}</i>`
					addNColumnRowWithElements(pageNode, version, numColumns, firstColumnIndex, {
						squirrelStartIndex: squirrelRangeStart,
						sideBarInfo: isLeft? {
							title: "Roasters",
							subtitle: subtitle,
						} : null,
					})
					numSquirrelRows = numSquirrelRows + 1
					break;
				case RowType_SalterRow:
					var squirrelRangeStart = numSquirrelRows * factoryColumnCount + 1
					var squirrelRangeEnd = (numSquirrelRows + 1) * factoryColumnCount
					var subtitle = `<i>Squirrel spaces ${squirrelRangeStart}-${squirrelRangeEnd}</i>`
					addNColumnRowWithElements(pageNode, version, numColumns, firstColumnIndex, {
						squirrelStartIndex: squirrelRangeStart,
						sideBarInfo: isLeft? {
							title: "Salters",
							subtitle: subtitle,
						} : null,
					})
					numSquirrelRows = numSquirrelRows + 1
					break;
				case RowType_SquirrelRow:
					var squirrelRangeStart = numSquirrelRows * factoryColumnCount + 1
					var squirrelRangeEnd = (numSquirrelRows + 1) * factoryColumnCount
					var subtitle = `<i>Squirrel spaces ${squirrelRangeStart}-${squirrelRangeEnd}</i>`
					addNColumnRowWithElements(pageNode, version, numColumns, firstColumnIndex, {
						squirrelStartIndex: squirrelRangeStart,
						sideBarInfo: isLeft? {
							title: "Empty",
							subtitle: subtitle,
						} : null,
					})
					numSquirrelRows = numSquirrelRows + 1
					break;
				case RowType_OrdersRow:
					addNColumnOrdersRow(pageNode, version, numColumns, firstColumnIndex, {
						sideBarInfo: isLeft? {
							title: "Orders",
						} : null,
					})
					break;
			}
			rowsThisPage++
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

	function addCrossTile(parentNode) {
		var crossTile = gameUtils.addDiv(parentNode, "crossTile", "crossTile")
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

		var totalNumTiles = 30

		for (let i = 0; i < totalNumTiles; i++) {
			addCrossTile(pageNode)
		}

		return pageNode
	}

	function createBoard(factoryColumnCount, version) {
		var bodyNode = dom.byId("body");

		var firstColumnIndex = 0

		// First column is special case.
		addNColumnStrip(bodyNode, version, factoryColumnCount, 1, firstColumnIndex)
		var firstColumnIndex = 1

		var outstandingNumColumns = factoryColumnCount

		var columnsPerStrip = 4
		while (outstandingNumColumns > 0) {
			var numColumns = Math.min(outstandingNumColumns, columnsPerStrip)
			addNColumnStrip(bodyNode, version, factoryColumnCount, numColumns, firstColumnIndex)
			firstColumnIndex = firstColumnIndex + numColumns
			outstandingNumColumns = outstandingNumColumns - numColumns
		}
	}

	function createStrips() {
		var bodyNode = dom.byId("body");
		addCrossTilesPage(bodyNode)
	}

	// This returned object becomes the defined value of this module
    return {
		createV004: function() {
			createBoard(12, "v004")
		},
        createV003: function () {
			createBoard(10, "v003")
        },
		createStrips: function() {
			createStrips()
		}
    };
});