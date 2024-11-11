define([
	'dojo',
    'dojo/dom',
	"dojo/query",
	'dojo/dom-style',
	'javascript/beltUtils',
	'javascript/gameUtils',
	'javascript/markers',
	'javascript/cards',
	'javascript/crossTiles',
	'dojo/domReady!'
], function(dojo, dom, query, domStyle, beltUtils, gameUtils, markers, cards, crossTiles){
	var rowZUIndex = 0
	var RowType_NumberRow = 1
	var RowType_DispenserRow = 2
	var RowType_ConveyorRow = 3
	var RowType_SquirrelRow = 4
	var RowType_RoasterRow = 5
	var RowType_SalterRow = 6
	var RowType_OrdersRow = 7
	// A cross tile hits two slots.
	// Say first slot is row i, column j.
	// Then the cross tile is stored in crossTilesByRowThenColumn[i][j]
	var crossTylesByRowThenColumn = []

	var factoryColumnCountByVersion = {}
	factoryColumnCountByVersion[gameUtils.version003] = 10
	factoryColumnCountByVersion[gameUtils.version004] = 12
	factoryColumnCountByVersion[gameUtils.version004_01] = 16

	var dispensersRowId = "dispensersRow"
	var ordersRowId = "ordersRow"
	var squirrelRowPrefix = "squirrelRow"

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

	var rowTypesForV004_01 = [
		RowType_NumberRow,
		RowType_DispenserRow,
		RowType_ConveyorRow,
		RowType_ConveyorRow,
		RowType_SalterRow,
		RowType_ConveyorRow,
		RowType_ConveyorRow,
		RowType_SquirrelRow,
		RowType_ConveyorRow,
		RowType_ConveyorRow,
		RowType_OrdersRow,
	]

	var rowTypesByVersion = {}
	rowTypesByVersion[gameUtils.version003] = rowTypesForV003
	rowTypesByVersion[gameUtils.version004] = rowTypesForV004
	rowTypesByVersion[gameUtils.version004_01] = rowTypesForV004_01

	var numSquirrelRows = 0

	var version
	var maxRowsPerPage
	var factoryColumnCount
	var firstFactoryColumnIndexThisStrip

	// Add a sideBar to the row with labels & whatnot.
	function addSidebar(parentNode, sideBarInfo) {
		var sideBar = gameUtils.addDiv(parentNode, ["sideBar"], "sideBar")
		var wrapper = gameUtils.addDiv(sideBar, ["wrapper"], "wrapper")
		gameUtils.addDiv(wrapper, ["title"], "title", sideBarInfo.title)
		if (sideBarInfo.subtitle) {
			gameUtils.addDiv(wrapper, ["subtitle"], "subtitle", sideBarInfo.subtitle)
		}
		if (sideBarInfo.instructions)
		{
			gameUtils.addDiv(wrapper, ["instructions"], "instructions", sideBarInfo.instructions)
		}

		return sideBar
	}


	// Add a row: side bar plus content.
	function addRowWithSidebarAndContent(parentNode, opt_configs) {
		var configs = opt_configs ? opt_configs : {}
		var darkBackground = configs.darkBackground ? true : false
		var sideBarInfo = configs.sideBarInfo
		var customRowHeight = configs.customRowHeight
		var classArray = configs.classArray ?  configs.classArray : []
		var rowId = configs.id ? configs.id : "row"

		var versionClassArray = gameUtils.versionToClassArray(gameUtils.version004_01)
		classArray = classArray.concat(versionClassArray)
		var row = gameUtils.addRow(parentNode, classArray, rowId)

		var finalHeight = customRowHeight ? customRowHeight : gameUtils.standardRowHeight
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
			gameUtils.addDiv(row, ["darkBackground"], 'darkBackground')
		}

		var content = addContent(row)

		return [row, content]
	}

	function addContent(parentNode) {
		var content = gameUtils.addDiv(parentNode, ["content"], "content")
		return content
	}

	function applyStandardElementStyling(element) {
		domStyle.set(element, {
			"width": `${gameUtils.elementWidth}px`,
			"height": `${gameUtils.elementHeight}px`,
			"z-index": `${gameUtils.elementZIndex}`,
			"margin-top": `${gameUtils.elementTopAndBottomMargin}px`,
			"margin-left": `${gameUtils.elementLeftAndRightMargin}px`,
		})
	}

	function addStraightBelt(parentNode, opt_configs) {
		var configs = opt_configs ? opt_configs : {}
		var hideBeltTop = configs.hideBeltTop ? true : false
		var hideBeltBottom = configs.hideBeltBottom ? true : false

		var belt = gameUtils.addDiv(parentNode, ["belt"], "belt")
		domStyle.set(belt, {
			"z-index": `${gameUtils.beltZIndex}`,
		})

		for (let i = 0; i < gameUtils.beltSegmentsPerRow; i++) {
			if (hideBeltTop && i < gameUtils.beltSegmentsPerRow/2) {
				continue;
			}
			if (hideBeltBottom && i >= gameUtils.beltSegmentsPerRow/2 - 1) {
				continue;
			}
			var yOffset = gameUtils.beltSegmentOffset/2 + i * gameUtils.beltSegmentOffset
			beltUtils.addBeltSegment(belt, gameUtils.slotWidth/2, yOffset)
		}

		return belt
	}

	// columnIndex is 0-based.
	function addNthElement(parentNode, columnIndex, opt_classArray) {
		var classArray = gameUtils.extendOptClassArray(opt_classArray, "element")
		var elementId = gameUtils.getElementId(columnIndex)
		var element = gameUtils.addDiv(parentNode, classArray, elementId)

		applyStandardElementStyling(element)

		return element
	}

	function addSquirrelIndex(parentNode, squirrelIndex) {
		var squirrelIndexElement = gameUtils.addDiv(parentNode, ["squirrelTitle"], "squirrelTitle", "Squirrel")
		var squirrelIndexElement = gameUtils.addDiv(parentNode, ["squirrelIndex"], "squirrelIndex", squirrelIndex)
		return squirrelIndexElement
	}

	function addStandardSlot(parentNode, rowIndex, columnIndex) {
		var slotId = gameUtils.makeSlotId(rowIndex, columnIndex)
		var classArray = ["slot"]
		var node = gameUtils.addDiv(parentNode, classArray, slotId)
		domStyle.set(node, {
			"width": `${gameUtils.slotWidth}px`,
		})
		return node
	}

	function addStandardSlotWithNumber(parent, rowIndex, columnIndex) {
		var standardSlot = addStandardSlot(parent, rowIndex, columnIndex)
		var elementId = gameUtils.getElementId(columnIndex)
		// Column index is zero based: when we render the number we want it to start at one.
		var columnNumber = columnIndex + 1
		var numberNode = gameUtils.addDiv(standardSlot, ["number"], elementId, columnNumber)
		applyStandardElementStyling(numberNode)
		return standardSlot
	}

	function adjustNumFactoryColumnsInThisRow(numFactoryColumnsInThisRow) {
		var numFactoryColumnsLeft = factoryColumnCount - firstFactoryColumnIndexThisStrip
		numFactoryColumnsInThisRow = Math.min(numFactoryColumnsLeft, numFactoryColumnsInThisRow)
		return numFactoryColumnsInThisRow
	}

	function addStandardSlotWithElementAndBelt(parentNode, rowIndex, columnIndex, opt_configs) {
		// Column index is 0-based.
		var classArray = opt_configs && opt_configs.classArray ? opt_configs.classArray : null
		var tweakElement = opt_configs && opt_configs.tweakElement ? opt_configs.tweakElement : null
		var skipElement = opt_configs && opt_configs.skipElement ? true : false
		var squirrelIndex = opt_configs && opt_configs.squirrelIndex ? opt_configs.squirrelIndex : null

		var standardSlot = addStandardSlot(parentNode, rowIndex, columnIndex)

		if (!skipElement) {
			var element = addNthElement(standardSlot, columnIndex, classArray)
			if (squirrelIndex) {
				addSquirrelIndex(element, squirrelIndex)
			}
			if (tweakElement) {
				tweakElement(element)
			}
		}
		addStraightBelt(standardSlot, opt_configs)

		return standardSlot
	}

	function getSquirrelDetailsForRow(rowType, numSquirrelRows)
	{
		switch (rowType) {
			case RowType_RoasterRow:
			case RowType_SalterRow:
				{
					if (version >= gameUtils.version004_01) {
						return [null, null]
					}
				}
			// deliberate fallthrough
			case RowType_SquirrelRow:
				{
					var squirrelRangeStart = numSquirrelRows * factoryColumnCount + 1
					var squirrelRangeEnd = (numSquirrelRows + 1) * factoryColumnCount
					var subtitle
					if (version < gameUtils.version004_01) {
						subtitle = `<i>Squirrel spaces ${squirrelRangeStart}-${squirrelRangeEnd}</i>`
					}
					return [squirrelRangeStart, subtitle]
				}
			default:
				{

					return [null, null]
				}
		}
	}

	function addNColumnRowWithElements(parentNode, rowIndex, rowType, numFactoryColumnsInThisRow, opt_configs) {
		var configs = opt_configs ? opt_configs : {}
		var [squirrelRangeStart, subtitle] = getSquirrelDetailsForRow(rowType, numSquirrelRows)
		if (squirrelRangeStart != null) {
			numSquirrelRows++
		}
		if (configs.sideBarInfo) {
			opt_configs.sideBarInfo.subtitle = subtitle
		}

		var [row, content] = addRowWithSidebarAndContent(parentNode, opt_configs)
		var elementConfigs = configs.elementConfigs ? configs.elementConfigs : {}

		for (let i = 0; i < numFactoryColumnsInThisRow; i++) {
			var squirrelIndex
			if (squirrelRangeStart) {
				squirrelIndex = squirrelRangeStart + i + firstFactoryColumnIndexThisStrip
			}
			elementConfigs.squirrelIndex = squirrelIndex
			addStandardSlotWithElementAndBelt(content, rowIndex, firstFactoryColumnIndexThisStrip + i, elementConfigs)
		}

		return row
	}

	function addNColumnRowWithNumbers(parentNode, rowIndex, numFactoryColumnsInThisRow, opt_configs) {
		var [row, content] = addRowWithSidebarAndContent(parentNode, opt_configs)

		for (let i = 0; i < numFactoryColumnsInThisRow; i++) {
			var columnIndex = firstFactoryColumnIndexThisStrip + i
			addStandardSlotWithNumber(content, rowIndex, columnIndex)
		}
		return row
	}

	function addNColumnRowWithConveyors(parentNode, rowIndex, numFactoryColumnsInThisRow, opt_configs) {
		var [row, content] = addRowWithSidebarAndContent(parentNode, opt_configs)

		var configs = opt_configs ? opt_configs : {}
		configs.skipElement = true
		for (let i = 0; i < numFactoryColumnsInThisRow; i++) {
			addStandardSlotWithElementAndBelt(content, rowIndex, firstFactoryColumnIndexThisStrip + i, configs)
		}
		return row
	}

	function tweakOrderRowCardSlot(node)	{
		var cardSlotHeight = gameUtils.standardRowHeight/2 - 2 * (gameUtils.ordersRowMarginTop)
		domStyle.set(node, {
			"width": `${gameUtils.cardWidth}px`,
			"height": `${cardSlotHeight}px`,
			"margin-top": `${gameUtils.ordersRowMarginTop}px`,
			"display": "block",
		})
	}

	function addNColumnOrdersRow(parentNode, rowIndex, rowType, numFactoryColumnsInThisRow, opt_sidebarInfo) {
		addNColumnRowWithElements(parentNode, rowIndex, rowType, numFactoryColumnsInThisRow, {
			classArray: ["orders"],
			id: ordersRowId,
			sideBarInfo: opt_sidebarInfo,
			darkBackground: true,
			customRowHeight: gameUtils.standardRowHeight/2,
			elementConfigs: {
				classArray: ["cardSlot"],
				tweakElement: tweakOrderRowCardSlot,
				hideBeltBottom: true,
			}
		})
	}

	function addNColumnStrip(parentNode, numFactoryColumnsInThisRow, opt_addSidebar) {
		var pageNode = gameUtils.addPageOfItems(parentNode)

		var rowTypes = rowTypesByVersion[version]

		numSquirrelRows = 0

		numFactoryColumnsInThisRow = adjustNumFactoryColumnsInThisRow(numFactoryColumnsInThisRow)

		var rowsThisPage = 0
		for (let i = 0; i < rowTypes.length; i++) {
			var rowIndex = i
			if (rowsThisPage >= maxRowsPerPage)
			{
				pageNode = gameUtils.addPageOfItems(parentNode)
				rowsThisPage = 0
			}

			var rowType = rowTypes[i]

			switch (rowType) {
				case RowType_NumberRow:
					addNColumnRowWithNumbers(pageNode, rowIndex, numFactoryColumnsInThisRow, {
						classArray: ["numbers"],
						sideBarInfo: opt_addSidebar? {
							title: "",
						} : null,
					})
					break;
				case RowType_DispenserRow:
					addNColumnRowWithElements(pageNode, rowIndex, rowType, numFactoryColumnsInThisRow, {
						id: dispensersRowId,
						classArray: ["nutDispensers"],
						sideBarInfo: opt_addSidebar? {
							title: "Dispensers",
						} : null,
						elementConfigs: {
							hideBeltTop: true,
						},
					})
					break;
				case RowType_ConveyorRow:
					addNColumnRowWithConveyors(pageNode, rowIndex, numFactoryColumnsInThisRow, {
						classArray: ["conveyors"],
						sideBarInfo: opt_addSidebar? {
							title: "Conveyor",
						} : null,
					})
					break;
				case RowType_RoasterRow:
					addNColumnRowWithElements(pageNode, rowIndex, rowType, numFactoryColumnsInThisRow, {
						sideBarInfo: opt_addSidebar? {
							title: "Roasters",
						} : null,
					})
					break;
				case RowType_SalterRow:
					addNColumnRowWithElements(pageNode, rowIndex, rowType, numFactoryColumnsInThisRow, {
						sideBarInfo: opt_addSidebar? {
							title: "Salters",
						} : null,
					})
					break;
				case RowType_SquirrelRow:
					var squirrelRowId = `${squirrelRowPrefix}${numSquirrelRows}`
					addNColumnRowWithElements(pageNode, rowIndex, rowType, numFactoryColumnsInThisRow, {
						id: squirrelRowId,
						sideBarInfo: opt_addSidebar? {
							title: "Squirrel",
						} : null,
					})
					break;
				case RowType_OrdersRow:
					var sideBarInfo = opt_addSidebar? {
						title: "Orders",
					} : null
					addNColumnOrdersRow(pageNode, rowIndex, rowType, numFactoryColumnsInThisRow, sideBarInfo)
					break;
			}
			rowsThisPage++
		}
		firstFactoryColumnIndexThisStrip = firstFactoryColumnIndexThisStrip + numFactoryColumnsInThisRow
	}

	function createBoard(_version, configs) {
		version = _version
		maxRowsPerPage =  configs.maxRowsPerPage
		var columnsPerStrip = configs.columnsPerStrip
		var bodyNode = dom.byId("body");

		firstFactoryColumnIndexThisStrip = 0
		if (configs.factoryColumnCount) {
			factoryColumnCount = configs.factoryColumnCount
		} else {
			factoryColumnCount = factoryColumnCountByVersion[version]
		}

		// Special case if we are doing all the columns in one go.
		if (columnsPerStrip >= factoryColumnCount) {
			addNColumnStrip(bodyNode, factoryColumnCount, true)
			return
		}

		// Put the sidebar alone.
		if (columnsPerStrip < factoryColumnCount) {
			addNColumnStrip(bodyNode, 0, true)
		}

		var outstandingNumColumns = factoryColumnCount
		while (outstandingNumColumns > 0) {
			var numFactoryColumnsInThisRow = Math.min(outstandingNumColumns, columnsPerStrip)
			addNColumnStrip(bodyNode, numFactoryColumnsInThisRow)
			outstandingNumColumns = outstandingNumColumns - numFactoryColumnsInThisRow
		}
	}

	function fixupMarkerStyling(marker) {
		var style = {}
		style["margin"] = "0px"
		style["position"] = "absolute"
		style["background-color"] = "#ffffff"
		domStyle.set(marker, style)
	}

	// columnnIndex is 0-based, ignoring the sidebar.
	function addMarker(rowId, columnIndex, markerType, opt_classArray) {
		var rowNode = dom.byId(rowId)
		// add a marker to this element.
		var elementId = gameUtils.getElementId(columnIndex)
		var elementNodes = query(`#${elementId}`, rowNode)
		// add marker here.
		var marker = markers.makeMarker(elementNodes[0], markerType, opt_classArray)
		fixupMarkerStyling(marker)
		return marker
	}

	function storeCrossTile(rowIndex, columnIndex, crossTile) {
		if (!crossTylesByRowThenColumn[rowIndex]) {
			crossTylesByRowThenColumn[rowIndex] = []
		}
		if (!crossTylesByRowThenColumn[rowIndex][columnIndex]) {
			crossTylesByRowThenColumn[rowIndex][columnIndex] = []
		}
		crossTylesByRowThenColumn[rowIndex][columnIndex].push(crossTile)
	}

	function getCrossTile(rowIndex, columnIndex) {
		if (!crossTilesByRowThenColumn[rowIndex]) {
			return null
		}
		return crossTilesByRowThenColumn[rowIndex][columnIndex]
	}

	function addCrossTile(rowIndex, columnIndex) {
		var slotId = gameUtils.makeSlotId(rowIndex, columnIndex)
		var slot = dom.byId(slotId)
		console.log("Doug: addCrossTile: rowIndex = ", rowIndex)
		console.log("Doug: addCrossTile: columnIndex = ", columnIndex)
		console.log("Doug: addCrossTile: slot = ", slot)
		var crossTile = crossTiles.addCrossTile(slot)
		console.log("Doug: addCrossTile: crossTile = ", crossTile)
		console.log("Doug: addCrossTile: crossTile = ", crossTile)


		domStyle.set(crossTile, {
			"margin-left": `${gameUtils.crossTileOnBoardLeftMargin}px`,
			"margin-top": `${gameUtils.crossTileOnBoardTopMargin}px`,
		})

		console.log("Doug: addCrossTile: crossTile = ", crossTile)
		storeCrossTile(rowIndex, columnIndex, crossTile)

		return crossTile
	}

	// columnnIndex is 0-based, ignoring the sidebar.
	function addOrder(nutType, columnIndex)
	{
		var ordersRow = dom.byId(ordersRowId)
		// Element number is 1-based, column index is 0-based.
		var elementId = gameUtils.getElementId(columnIndex)
		var orderNodes = query(`#${elementId}`, ordersRow)
		// add a nut type marker to this element.
		return cards.makeOrderCardSingleNut(orderNodes[0], nutType, columnIndex)
	}

	// This returned object becomes the defined value of this module
    return {
		// Can be used to make a board in sections or a complete board.
		createBoard: createBoard,

		dispensersRowId : dispensersRowId,
		ordersRowId: ordersRowId,
		squirrelRowPrefix: squirrelRowPrefix,

		// Add various game elements to the board.
		addMarker: addMarker,
		addOrder: addOrder,
		addCrossTile: addCrossTile,
    };
});