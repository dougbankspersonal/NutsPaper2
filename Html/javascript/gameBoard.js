define([
    'dojo/dom',
	"dojo/query",
	'dojo/dom-style',
	'dojo/dom-class',
	'javascript/beltUtils',
	'javascript/gameUtils',
	'javascript/markers',
	'javascript/cards',
	'javascript/crossTiles',
	'javascript/rowTypes',
	'javascript/versionDetails',
	'dojo/domReady!'
], function(dom, query, domStyle, domClass, beltUtils, gameUtils, markers, cards, crossTiles, rowTypes, versionDetails){
	var rowZUIndex = 0

	// A cross tile hits two slots.
	// Say first slot is row i, column j.
	// Then the cross tile is stored in crossTileIdsByRowThenColumn[i][j]
	var crossTileIdsByRowThenColumn = {}
	var addedCrossTileIndex = 0

	var numSquirrelRows = 0

	var firstFactoryColumnIndexThisStrip

	// Add a sideBar to the row with labels & whatnot.
	function addSidebar(parentNode, sideBarInfo) {
		var sideBar = gameUtils.addDiv(parentNode, ["sideBar"], "sideBar")
		domStyle.set(sideBar, {
			width: `${gameUtils.sideBarWidth}px`,
		})

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
	function addRowWithSidebarAndContent(parentNode, rowIndex, opt_configs) {
		var configs = opt_configs ? opt_configs : {}
		var darkBackground = configs.darkBackground ? true : false
		var sideBarInfo = configs.sideBarInfo
		var customRowHeight = configs.customRowHeight
		var classArray = configs.classArray ?  configs.classArray : []

		var row = gameUtils.addRow(parentNode, classArray, rowIndex)

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
		gameUtils.addStandardBorder(element)

		return element
	}

	function addSquirrelIndex(parentNode, squirrelIndex) {
		var squirrelIndexElement = gameUtils.addDiv(parentNode, ["squirrelTitle"], "squirrelTitle", "Squirrel")
		var squirrelIndexElement = gameUtils.addDiv(parentNode, ["squirrelIndex"], "squirrelIndex", squirrelIndex)
		return squirrelIndexElement
	}

	function addStandardSlot(parentNode, rowIndex, columnIndex) {
		var slotId = gameUtils.getSlotId(rowIndex, columnIndex)
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

	function adjustNumFactoryColumnsInThisRow(factoryColumnCount, numFactoryColumnsInThisRow) {
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

	function addNColumnRowWithElements(parentNode, rowIndex, rowType, factoryColumnCount, numFactoryColumnsInThisRow, opt_configs) {
		var configs = opt_configs ? opt_configs : {}
		var squirrelRangeStart
		if (rowType == rowTypes.RowTypes.Squirrel) {
			squirrelRangeStart = numSquirrelRows * factoryColumnCount + 1
		}
		if (squirrelRangeStart != null) {
			numSquirrelRows++
		}

		var [row, content] = addRowWithSidebarAndContent(parentNode, rowIndex, opt_configs)
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
		var [row, content] = addRowWithSidebarAndContent(parentNode, rowIndex, opt_configs)

		for (let i = 0; i < numFactoryColumnsInThisRow; i++) {
			var columnIndex = firstFactoryColumnIndexThisStrip + i
			addStandardSlotWithNumber(content, rowIndex, columnIndex)
		}
		return row
	}

	function addNColumnRowWithConveyors(parentNode, rowIndex, numFactoryColumnsInThisRow, opt_configs) {
		var [row, content] = addRowWithSidebarAndContent(parentNode, rowIndex, opt_configs)

		var configs = opt_configs ? opt_configs : {}
		configs.skipElement = true
		for (let i = 0; i < numFactoryColumnsInThisRow; i++) {
			addStandardSlotWithElementAndBelt(content, rowIndex, firstFactoryColumnIndexThisStrip + i, configs)
		}
		return row
	}

	function tweakBoxesRowCardSlot(node)	{
		var cardSlotHeight = gameUtils.standardRowHeight/2 - 2 * (gameUtils.boxesRowMarginTop)
		domStyle.set(node, {
			"width": `${gameUtils.cardWidth}px`,
			"height": `${cardSlotHeight}px`,
			"margin-top": `${gameUtils.boxesRowMarginTop}px`,
			"display": "block",
		})
	}

	function addNColumnBoxesRow(parentNode, rowIndex, rowType, factoryColumnCount, numFactoryColumnsInThisRow, opt_sideBarInfo) {
		addNColumnRowWithElements(parentNode, rowIndex, rowType, factoryColumnCount, numFactoryColumnsInThisRow, {
			classArray: ["boxes"],
			sideBarInfo: opt_sideBarInfo,
			darkBackground: true,
			customRowHeight: gameUtils.boxesRowHeight,
			elementConfigs: {
				classArray: ["cardSlot"],
				tweakElement: tweakBoxesRowCardSlot,
				hideBeltBottom: true,
			}
		})
	}

	function addNColumnStrip(parentNode, rowTypesForVersion, factoryColumnCount, numFactoryColumnsInThisRow, maxRowsPerPage, opt_addSidebar) {
		var pageNode = gameUtils.addPageOfItems(parentNode)

		numSquirrelRows = 0

		numFactoryColumnsInThisRow = adjustNumFactoryColumnsInThisRow(factoryColumnCount, numFactoryColumnsInThisRow)

		var rowsThisPage = 0
		for (let i = 0; i < rowTypesForVersion.length; i++) {
			var rowIndex = i
			var rowType = rowTypesForVersion[i]

			if (rowsThisPage >= maxRowsPerPage)
			{
				pageNode = gameUtils.addPageOfItems(parentNode)
				rowsThisPage = 0
			}

			switch (rowType) {
				case rowTypes.RowTypes.Number:
					addNColumnRowWithNumbers(pageNode, rowIndex, numFactoryColumnsInThisRow, {
						classArray: ["numbers"],
						sideBarInfo: opt_addSidebar? {
							title: "",
						} : null,
					})
					break
				case rowTypes.RowTypes.Dispenser:
					addNColumnRowWithElements(pageNode, rowIndex, rowType, factoryColumnCount, numFactoryColumnsInThisRow, {
						classArray: ["nutDispensers"],
						sideBarInfo: opt_addSidebar? {
							title: "Dispensers",
						} : null,
						elementConfigs: {
							hideBeltTop: true,
						},
					})
					break
				case rowTypes.RowTypes.Conveyor:
				case rowTypes.RowTypes.Path:
					var title = rowTypes.rowTitle(rowType)
					addNColumnRowWithConveyors(pageNode, rowIndex, numFactoryColumnsInThisRow, {
						classArray: ["conveyors"],
						sideBarInfo: opt_addSidebar? {
							title: title,
						} : null,
					})
					break
				case rowTypes.RowTypes.Heart:
				case rowTypes.RowTypes.Skull:
				case rowTypes.RowTypes.Start:
				case rowTypes.RowTypes.End:
				case rowTypes.RowTypes.Salter:
				case rowTypes.RowTypes.Roaster:
				case rowTypes.RowTypes.Squirrel:
					var title = rowTypes.rowTitle(rowType)
					addNColumnRowWithElements(pageNode, rowIndex, rowType, factoryColumnCount, numFactoryColumnsInThisRow, {
						sideBarInfo: opt_addSidebar? {
							title: title,
						} : null,
					})
					break
				case rowTypes.RowTypes.Boxes:
					var title = rowTypes.rowTitle(rowType)
					var sideBarInfo = opt_addSidebar? {
						title: title,
					} : null
					addNColumnBoxesRow(pageNode, rowIndex, rowType, factoryColumnCount, numFactoryColumnsInThisRow, sideBarInfo)
					break
			}
			rowsThisPage++
		}
		firstFactoryColumnIndexThisStrip = firstFactoryColumnIndexThisStrip + numFactoryColumnsInThisRow
	}

	function createBoard(configs) {
		var rowTypesForVersion = configs.rowTypesForVersion
		var factoryColumnCount = configs.factoryColumnCount
		var maxRowsPerPage
		if (configs.maxRowsPerPage) {
			maxRowsPerPage = configs.maxRowsPerPage
		} else {
			maxRowsPerPage = rowTypesForVersion.length
		}

		var columnsPerStrip
		if (configs.columnsPerStrip) {
			columnsPerStrip = configs.columnsPerStrip
		} else {
			columnsPerStrip = factoryColumnCount + 1
		}

		var bodyNode = dom.byId("body");

		firstFactoryColumnIndexThisStrip = 0

		// Special case if we are doing all the columns in one go.
		if (columnsPerStrip >= factoryColumnCount) {
			addNColumnStrip(bodyNode, rowTypesForVersion, factoryColumnCount, factoryColumnCount, maxRowsPerPage, true)
			return
		}

		// Put the sideBar alone.
		if (columnsPerStrip < factoryColumnCount) {
			addNColumnStrip(bodyNode, rowTypesForVersion, factoryColumnCount, 0, maxRowsPerPage, true)
		}

		var outstandingNumColumns = factoryColumnCount
		while (outstandingNumColumns > 0) {
			var numFactoryColumnsInThisRow = Math.min(outstandingNumColumns, columnsPerStrip)
			addNColumnStrip(bodyNode, rowTypesForVersion, factoryColumnCount, numFactoryColumnsInThisRow, maxRowsPerPage)
			outstandingNumColumns = outstandingNumColumns - numFactoryColumnsInThisRow
		}
	}

	function fixupMarkerStyling(marker) {
		var style = {}
		style["margin"] = "0px"
		style["position"] = "absolute"
		domStyle.set(marker, style)
	}

	// columnnIndex is 0-based, ignoring the sideBar.
	function addMarker(rowIndex, columnIndex, markerType, opt_classArray, opt_additionalConfig) {
		console.log("Doug: rowIndex = ", rowIndex)
		console.log("Doug: columnIndex = ", columnIndex)
		console.log("Doug: markerType = ", markerType)
		var rowId = gameUtils.getRowId(rowIndex)
		var rowNode = dom.byId(rowId)
		// add a marker to this element.
		var elementNode = gameUtils.getElementFromRow(rowNode, columnIndex)
		// add marker here.
		var marker = markers.addMarker(elementNode, markerType, opt_classArray, opt_additionalConfig)
		fixupMarkerStyling(marker)
		return marker
	}

	function storeCrossTileId(rowIndex, columnIndex, crossTileId) {
		var rowIndexString = "X_" + rowIndex.toString()
		var columnIndexString = "X_" + columnIndex.toString()

		if (!crossTileIdsByRowThenColumn[rowIndexString]) {
			crossTileIdsByRowThenColumn[rowIndexString] = {}
		}
		crossTileIdsByRowThenColumn[rowIndexString][columnIndexString] = crossTileId
	}

	function getStoredCrossTileId(rowIndex, columnIndex) {
		var rowIndexString = "X_" + rowIndex.toString()
		var columnIndexString = "X_" + columnIndex.toString()

		if (!crossTileIdsByRowThenColumn[rowIndexString]) {
			return null
		}
		return crossTileIdsByRowThenColumn[rowIndexString][columnIndexString]
	}

	function getStoredCrossTile(rowIndex, columnIndex) {
		var crossTileId = getStoredCrossTileId(rowIndex, columnIndex)
		if (!crossTileId) {
			return null
		}
		var crossTiles = query(`#${crossTileId}`)
		return crossTiles[0]
	}

	function getNextCrossTileId() {
		return `crossTile_${addedCrossTileIndex++}`
	}

	function addCrossTile(rowIndex, columnIndex, opt_classArray) {
		var slotId = gameUtils.getSlotId(rowIndex, columnIndex)
		var slot = dom.byId(slotId)
		var crossTileId = getNextCrossTileId()
		var crossTile = crossTiles.addCrossTile(slot, crossTileId, opt_classArray)

		domStyle.set(crossTile, {
			"margin-left": `${gameUtils.crossTileOnBoardLeftMargin}px`,
			"margin-top": `${gameUtils.crossTileOnBoardTopMargin}px`,
			"z-index": `${gameUtils.crossTileZIndex}`,
		})

		storeCrossTileId(rowIndex, columnIndex, crossTileId)

		return crossTile
	}

	function getCrossTileInSlot(rowIndex, columnIndex)
	{
		var crossTile = getStoredCrossTile(rowIndex, columnIndex)
		if (crossTile) {
			return [crossTile, true]
		}
		crossTile = getStoredCrossTile(rowIndex, columnIndex - 1)
		if (crossTile) {
			return [crossTile, false]
		}
		return [null, false]
	}

	function highlightNode(node, color, opt_extra) {
		var variable = opt_extra ? "30px" : "5px"
		domStyle.set(node, {
			"box-shadow": `0 0 ${variable} ${variable} ${color}`,
			"background-color": color,
		})
	}

	function highlightQueryResult(node, queryArg, color) {
		var nodes = query(queryArg, node)
		for (var i = 0; i < nodes.length; i++) {
			var element = nodes[i]
			highlightNode(element, color)
		}
	}

	function highlightCrossTile(rowIndex, columnIndex, color, opt_translucentColor) {
		var crossTile = getStoredCrossTile(rowIndex, columnIndex)
		if (crossTile) {
			if (domClass.contains(crossTile, "ghost") && opt_translucentColor)
			{
				highlightNode(crossTile, opt_translucentColor, true)
			}
			else
			{
				highlightNode(crossTile, color, true)
			}
		}
	}

	function getSlotAndHighlightContents(rowIndex, columnIndex, color) {
		var slot = gameUtils.getSlot(rowIndex, columnIndex)
		if (!slot) {
			return null
		}
		// highlight elements, markers, box cards in this slot.
		var elementId = gameUtils.getElementId(columnIndex)
		highlightQueryResult(slot, "#" + elementId, color)
		highlightQueryResult(slot, ".marker", color)
		highlightQueryResult(slot, ".box", color)
		return slot
	}

	function addToken(parent, color, text) {
		var node = gameUtils.addDiv(parent, ["token"], "token")
		domStyle.set(node, {
			"background-color": color,
		})
		gameUtils.addStandardBorder(node)

		gameUtils.addDiv(node, ["text"], "text", text)

		return node
	}

	function highlightElementAndBeltsInSlot(rowIndex, columnIndex, color) {
		var slot = getSlotAndHighlightContents(rowIndex, columnIndex, color)
		if (!slot) {
			return false
		}

		// Find the cross tile, if any, on this space.
		var [crossTile, isLeft] = getCrossTileInSlot(rowIndex, columnIndex)

		if (crossTile) {
			var beltQuery = isLeft ? ".belt.left" : ".belt.right"
			var belts = query(beltQuery, crossTile)
			var belt = belts[0]
			highlightQueryResult(belt, ".beltSegment", color)
		} else {
			// Find the belt embedded on board, if any, on this space.
			var belts = query(".belt", slot)
			if (belts) {
				belt = belts[0]
				highlightQueryResult(belt, ".beltSegment", color)
			}
		}
		return true
	}

	function getColumnIndexNextRow(rowIndex, columnIndex)
	{
		var [crossTile, isLeft] = getCrossTileInSlot(rowIndex, columnIndex)
		if (crossTile) {
			if (isLeft) {
				return columnIndex + 1
			}
			else {
				return columnIndex - 1
			}
		}
		return columnIndex
	}

	function highlightPath(columnIndex, color) {
		// Go thru each row: find the slot on the path, highlight element and belt stuff in that slot.
		var columnIndexThisRow = columnIndex
		// First row is numbers, skip that.
		var rowIndex = 1
		while (true) {
			var success = highlightElementAndBeltsInSlot(rowIndex, columnIndexThisRow, color)
			if (!success) {
				break
			}
			columnIndexThisRow = getColumnIndexNextRow(rowIndex, columnIndexThisRow)
			rowIndex++
		}
	}

	// columnnIndex is 0-based, ignoring the sideBar.
	function addBox(nutType, rowIndex, columnIndex, opt_classArray)
	{
		var boxesRowId = gameUtils.getRowId(rowIndex)
		var boxesRow = dom.byId(boxesRowId)
		var element = gameUtils.getElementFromRow(boxesRow, columnIndex)
		// add an oredr card to this element.
		return cards.addBoxCardSingleNut(element, nutType, columnIndex, opt_classArray)
	}

	// This returned object becomes the defined value of this module
    return {
		// Can be used to make a board in sections or a complete board.
		createBoard: createBoard,

		addMarker: addMarker,
		addBox: addBox,
		addCrossTile: addCrossTile,
		highlightPath: highlightPath,
		highlightQueryResult: highlightQueryResult,
		highlightCrossTile: highlightCrossTile,
		getSlotAndHighlightContents: getSlotAndHighlightContents,
		addToken: addToken,
    };
});