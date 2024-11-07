define([
	'dojo',
    'dojo/dom',
	"dojo/query",
	'dojo/dom-style',
	'javascript/beltUtils',
	'javascript/gameUtils',
	'javascript/markers',
	'javascript/cards',
	'dojo/domReady!'
], function(dojo, dom, query, domStyle, beltUtils, gameUtils, markers, cards){
	var rowZUIndex = 0

	var RowType_NumberRow = 1
	var RowType_DispenserRow = 2
	var RowType_ConveyorRow = 3
	var RowType_SquirrelRow = 4
	var RowType_RoasterRow = 5
	var RowType_SalterRow = 6
	var RowType_OrdersRow = 7

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

	// Add a standard width cell.  May be extra long for cards, depends on class.
	function addSlot(parentNode, classes, id)
	{
		var slot = gameUtils.addDiv(parentNode, classes + " slot", id)
		domStyle.set(slot, {
			"width": `${gameUtils.slotWidth}px`,
			"margin-left": `${gameUtils.horizontalSpaceBetweenSlots/2}`,
			"margin-right": `${gameUtils.horizontalSpaceBetweenSlots/2}`,
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
	function addRowWithSidebarAndContent(parentNode, opt_configs) {
		var darkBackground = opt_configs && opt_configs.darkBackground ? true : false
		var sideBarInfo = opt_configs && opt_configs.sideBarInfo? opt_configs.sideBarInfo : null
		var customHeight = opt_configs && opt_configs.customHeight? opt_configs.customHeight : null
		var classes = opt_configs && opt_configs.classes? opt_configs.classes : ""
		var rowId = opt_configs && opt_configs.id? opt_configs.id : "row"

		var cssVersion = gameUtils.versionToCssFriendlyString(version)
		var finalClasses = cssVersion + " " + classes
		var row = gameUtils.addRow(parentNode, finalClasses, rowId)

		var finalHeight = customHeight ? customHeight : gameUtils.standardRowHeight
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

		return [row, content]
	}

	function addContent(parentNode) {
		var content = gameUtils.addDiv(parentNode, "content", "content")
		return content
	}

	function addStraightBelt(parentNode, opt_hideTop) {
		var belt = gameUtils.addDiv(parentNode, "belt", "belt")

		for (let i = 0; i < gameUtils.beltSegmentsPerRow; i++) {
			if (opt_hideTop && i < gameUtils.beltSegmentsPerRow/2) {
				continue;
			}
			var yOffset = gameUtils.beltSegmentOffset/2 + i * gameUtils.beltSegmentOffset
			beltUtils.addBeltSegment(belt, gameUtils.slotWidth/2, yOffset)
		}

		return belt
	}

	function addNthElement(parentNode, elementIndex, opt_customClasses) {
		var classes = "element"
		if (opt_customClasses) {
			classes = classes + " " + opt_customClasses
		}
		var element = gameUtils.addDiv(parentNode, classes, `element${elementIndex}`)

		if (!opt_customClasses) {
			domStyle.set(element, {
				"width": `${gameUtils.elementHeight}px`,
				"height": `${gameUtils.elementHeight}px`,
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
			"width": `${gameUtils.elementHeight}px`,
			"height": `${gameUtils.elementHeight}px`,
		})
		return standardSlot
	}

	function adjustNumFactoryColumnsInThisRow(numFactoryColumnsInThisRow) {
		var numFactoryColumnsLeft = factoryColumnCount - firstFactoryColumnIndexThisStrip
		numFactoryColumnsInThisRow = Math.min(numFactoryColumnsLeft, numFactoryColumnsInThisRow)
		return numFactoryColumnsInThisRow
	}

	function addStandardSlotWithElementAndBelt(parentNode, elementIndex, opt_configs) {
		var hideBeltTop = opt_configs && opt_configs.hideBeltTop ? true : false
		var classesForEachElement = opt_configs && opt_configs.classesForEachElement ? opt_configs.classesForEachElement : null
		var tweakElement = opt_configs && opt_configs.tweakElement ? opt_configs.tweakElement : null
		var skipElement = opt_configs && opt_configs.skipElement ? true : false
		var squirrelIndex = opt_configs && opt_configs.squirrelIndex ? opt_configs.squirrelIndex : null

		var standardSlot = addStandardSlot(parentNode)

		if (!skipElement) {
			var element = addNthElement(standardSlot, elementIndex, classesForEachElement)
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

	function addNColumnRowWithElements(parentNode, rowType, numFactoryColumnsInThisRow, opt_configs) {
		var [squirrelRangeStart, subtitle] = getSquirrelDetailsForRow(rowType, numSquirrelRows)
		if (squirrelRangeStart != null) {
			numSquirrelRows++
		}
		if (opt_configs)
		{
			if (opt_configs.sideBarInfo) {
				opt_configs.sideBarInfo.subtitle = subtitle
			}
		}

		var [row, content] = addRowWithSidebarAndContent(parentNode, opt_configs)
		console.log("Doug: addNColumnRowWithElements row = ", row)
		console.log("Doug: addNColumnRowWithElements content = ", content)

		var configs = opt_configs ? opt_configs : {}

		for (let i = 0; i < numFactoryColumnsInThisRow; i++) {
			var squirrelIndex
			if (squirrelRangeStart) {
				squirrelIndex = squirrelRangeStart + i + firstFactoryColumnIndexThisStrip
			}
			configs.squirrelIndex = squirrelIndex
			addStandardSlotWithElementAndBelt(content, firstFactoryColumnIndexThisStrip + i, configs)
		}
		return row
	}

	function addNColumnRowWithNumbers(parentNode, numFactoryColumnsInThisRow, opt_configs) {
		var [row, content] = addRowWithSidebarAndContent(parentNode, opt_configs)

		for (let i = 0; i < numFactoryColumnsInThisRow; i++) {
			var elementNumber = firstFactoryColumnIndexThisStrip + i + 1
			addStandardSlotWithNumber(content, elementNumber, opt_configs)
		}
		return row
	}

	function addNColumnRowWithConveyors(parentNode, numFactoryColumnsInThisRow, opt_configs) {
		var [row, content] = addRowWithSidebarAndContent(parentNode, opt_configs)

		var configs = opt_configs ? opt_configs : {}
		configs.skipElement = true
		for (let i = 0; i < numFactoryColumnsInThisRow; i++) {
			addStandardSlotWithElementAndBelt(content, firstFactoryColumnIndexThisStrip + i, configs)
		}
		return row
	}

	function tweakCardElement(node)	{
		domStyle.set(node, {
			"width": `${gameUtils.cardWidth}px`,
			"height": `${gameUtils.cardHeight}px`,
		})
	}

	function addNColumnOrdersRow(parentNode, rowType, numFactoryColumnsInThisRow, opt_sidebarInfo) {
		return addNColumnRowWithElements(parentNode, rowType, numFactoryColumnsInThisRow, {
			classes: "orders",
			id: ordersRowId,
			sideBarInfo: opt_sidebarInfo,
			darkBackground: true,
			classesForEachElement: "cardSlot",
			tweakElement: tweakCardElement,
		})
	}

	function addNColumnStrip(parentNode, numFactoryColumnsInThisRow, opt_addSidebar) {
		var pageNode = gameUtils.addPageOfItems(parentNode)

		var rowTypes = rowTypesByVersion[version]

		numSquirrelRows = 0

		numFactoryColumnsInThisRow = adjustNumFactoryColumnsInThisRow(numFactoryColumnsInThisRow)

		var rowsThisPage = 0
		for (let i = 0; i < rowTypes.length; i++) {
			if (rowsThisPage >= maxRowsPerPage)
			{
				pageNode = gameUtils.addPageOfItems(parentNode)
				rowsThisPage = 0
			}

			var rowType = rowTypes[i]

			switch (rowType) {
				case RowType_NumberRow:
					addNColumnRowWithNumbers(pageNode, numFactoryColumnsInThisRow, {
						classes: "numbers",
						sideBarInfo: opt_addSidebar? {
							title: "",
						} : null,
					})
					break;
				case RowType_DispenserRow:
					addNColumnRowWithElements(pageNode, rowType, numFactoryColumnsInThisRow, {
						id: dispensersRowId,
						classes: "nutDispensers",
						sideBarInfo: opt_addSidebar? {
							title: "Dispensers",
						} : null,
						hideBeltTop: true,
					})
					break;
				case RowType_ConveyorRow:
					addNColumnRowWithConveyors(pageNode, numFactoryColumnsInThisRow, {
						classes: "conveyors",
						sideBarInfo: opt_addSidebar? {
							title: "Conveyor",
						} : null,
					})
					break;
				case RowType_RoasterRow:
					addNColumnRowWithElements(pageNode, rowType, numFactoryColumnsInThisRow, {
						sideBarInfo: opt_addSidebar? {
							title: "Roasters",
						} : null,
					})
					break;
				case RowType_SalterRow:
					addNColumnRowWithElements(pageNode, rowType, numFactoryColumnsInThisRow, {
						sideBarInfo: opt_addSidebar? {
							title: "Salters",
						} : null,
					})
					break;
				case RowType_SquirrelRow:
					var squirrelRowId = `${squirrelRowPrefix}${numSquirrelRows}`
					addNColumnRowWithElements(pageNode, rowType, numFactoryColumnsInThisRow, {
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
					addNColumnOrdersRow(pageNode, rowType, numFactoryColumnsInThisRow, sideBarInfo)
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

	function addMarker(rowId, columnIndex, markerType, opt_classes) {
		var rowNode = dom.byId(rowId)
		// add a marker to this element.
		var elementId = `element${columnIndex}`
		var elementNodes = query(`#${elementId}`, rowNode)
		// add marker here.
		var marker = markers.makeMarker(elementNodes[0], markerType, opt_classes)
		fixupMarkerStyling(marker)
	}

	function addOrders(orderInstanceDescs)
	{
		console.log("Doug: addOrders ", orderInstanceDescs)
		console.log("Doug: addOrders ", ordersRowId)
		var ordersRow = dom.byId(ordersRowId)
		for (var i = 0; i < orderInstanceDescs.length; i++) {
			var orderInstanceDesc = orderInstanceDescs[i]
			var columnIndex = orderInstanceDesc.columnIndex
			var elementId = `element${columnIndex}`
			var orderNodes = query(`#${elementId}`, ordersRow)
			var nutType = orderInstanceDesc.nutType
			// add a nut type marker to this element.
			var position = dojo.position(orderNodes[0])
			console.log("Doug: position = ", position)
			var order = cards.makeOrderCardSingleNut(orderNodes[0], nutType, columnIndex)
		}
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
		addOrders: addOrders,
    };
});