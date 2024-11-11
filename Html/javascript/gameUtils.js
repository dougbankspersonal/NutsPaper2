define([
	'dojo/dom-construct',
	'dojo/domReady!'
], function(domConstruct) {
	var pageNumber = 0
	var rowNumber = 0
	var cardNumber = 0

	// Slots, elements, cross tiles.
	var slotWidth = 180

	var standardRowHeight = 180;
	var elementHeight = slotWidth - 20
	var elementWidth = elementHeight
	var elementTopAndBottomMargin = (standardRowHeight - elementHeight)/2
	var elementLeftAndRightMargin = (slotWidth - elementWidth)/2

	var crossTileOnBoardLeftMargin = 20
	var crossTileOnBoardTopMargin = 10

	// For a cross tile, it lays across two side by side slots:
	//
	// Slots: +------a------+------a------+
	// Tile : +-c-+---------b---------+-c-+
	// Where a is slotWidth, b is crossTileWidth, and c is crossTileOnBoardLeftMargin.
	// So...
	var crossTileWidth = 2 * (slotWidth - crossTileOnBoardLeftMargin)
	var crossTileHeight = standardRowHeight - 2 * crossTileOnBoardTopMargin

	// So we have this:
	// +------a------+------a------+
	// +-c-+---------b---------+-c-+
	// where b is the width of a cross tile, and c is crossTileOnBoardLeftMargin.
	// There's also a margin:
	var crossTileBorder = 2

	// Border on both sides: the space inside the cross tile is actually this big:
	var crossTileInnerWidth = crossTileWidth - 2 * crossTileBorder

	// So if belt elements are children of the cross tile div, what is the position that'd
	// put the belt in the center of a slot?
	var beltCenterOffsetInTile = slotWidth/2 - crossTileOnBoardLeftMargin - crossTileBorder

	// Cards.
	var cardWidth = slotWidth - 20
	var cardHeight = 1.4 * cardWidth
	var cardBackFontSize = cardWidth * 0.2

	var version003 = 3
	var version004 = 4
	var version004_01 = 4.01

	var nutTypeAlmond = "Almond"
	var nutTypeCashew = "Cashew"
	var nutTypePeanut = "Peanut"
	var nutTypePistachio = "Pistachio"
	var nutTypeWalnut = "Walnut"

	var isDemoBoard = false

	var nutTypesByVersion = []
	nutTypesByVersion[version003] = [
		nutTypeAlmond,
		nutTypePeanut,
	]
	nutTypesByVersion[version004] = [
		nutTypeAlmond,
		nutTypePeanut,
		nutTypePistachio,
		nutTypeWalnut,
	]
	nutTypesByVersion[version004_01] = [
		nutTypeAlmond,
		nutTypeCashew,
		nutTypePeanut,
		nutTypePistachio,
	]

	var nutTypeImages = {}
	nutTypeImages[nutTypeAlmond] = "images/NutProps/Simple.Almond.png"
	nutTypeImages[nutTypeCashew] = "images/NutProps/Simple.Cashew.png"
	nutTypeImages[nutTypePeanut] = "images/NutProps/Simple.Peanut.png"
	nutTypeImages[nutTypePistachio] = "images/NutProps/Simple.Pistachio.png"
	nutTypeImages[nutTypeWalnut] = "images/NutProps/Simple.Walnut.png"

	var saltedTypes = [
		"Salted",
		"Unsalted",
	]

	var roastedTypes = [
		"Roasted",
		"Raw",
	]

	var saltedTypeImages = [
		"images/NutProps/Salted.Y.png",
		"images/NutProps/Salted.N.png",
	]
	var roastedTypeImages = [
		"images/NutProps/Roasted.Y.png",
		"images/NutProps/Roasted.N.png",
	]

	var wildImage = "images/Order/Order.Wild.png"

	function addDiv(parent, classArray, id, opt_innerHTML = "") {
		var classes = classArray.join(" ")
		var node = domConstruct.create("div", {
			innerHTML: opt_innerHTML,
			className: classes,
			id: id
		}, parent)
		return node
	}

	function isString(value) {
		return typeof value === 'string'
	}

	function extendOptClassArray(opt_classArray, newClassOrClasses)
	{
		var classArray = opt_classArray ? opt_classArray: []
		if (isString(newClassOrClasses)) {
			classArray.push(newClassOrClasses)
			return classArray
		} else {
			// must be an array
			var newClassArray = classArray.concat(newClassOrClasses)
			return newClassArray
		}
	}

	function makeSlotId(rowIndex, columnIndex) {
		var idPieces = [
			"slot",
			rowIndex.toString(),
			columnIndex.toString(),
		]
		return idPieces.join("_")
	}

	function getElementId(columnIndex) {
		var elementId = "element_".concat(columnIndex.toString())
		return elementId
	}

	function addImage(parent, opt_classArray, id, image) {
		var classArray = opt_classArray ? opt_classArray: []
		var classes = classArray.join(" ")
		var node = domConstruct.create("img", {
			innerHTML: "",
			className: classes,
			id: id,
			src: image
		}, parent)
		return node
	}

	function addPageOfItems(parent, opt_classArray) {
		var pageId = "pageOfItems.".concat(pageNumber.toString())
		pageNumber++
		var classArray = extendOptClassArray(opt_classArray, "pageOfItems")

		if (isDemoBoard) {
			classArray.push("isDemoBoard")
		}
		return addDiv(parent, classArray, pageId)
	}

	function addRow(parent, opt_classArray, opt_id) {
		var classArray = extendOptClassArray(opt_classArray, "row")
		if (isDemoBoard) {
			classArray.push("isDemoBoard")
		}

		var rowId
		if (opt_id) {
			rowId = opt_id
		} else {
			rowId = "row.".concat(rowNumber.toString())
			rowNumber++
		}
		return addDiv(parent, classArray, rowId)
	}

	function addCard(parent, opt_classArray, opt_id) {
		var classArray = extendOptClassArray(opt_classArray, "card")
		if (isDemoBoard) {
			classArray.push("isDemoBoard")
		}
		var cardId
		if (opt_id) {
			cardId = opt_id
		} else {
			cardId = "card.".concat(cardNumber.toString())
			cardNumber++
		}
		return addDiv(parent, classArray, cardId)
	}

	// Function to convert hexadecimal color to RGB
	function hexToRgb(hex) {
		var r = parseInt(hex.substring(1, 3), 16);
		var g = parseInt(hex.substring(3, 5), 16);
		var b = parseInt(hex.substring(5, 7), 16);
		return [r, g, b];
	}

	// Function to convert RGB color to hexadecimal
	function rgbToHex(r, g, b) {
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}

	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	function blendHexColors(color1, color2) {
		// Parse hexadecimal color strings into arrays of RGB values
		var rgb1 = hexToRgb(color1);
		var rgb2 = hexToRgb(color2);

		// Calculate the blended RGB values
		var blendedRgb = [
			Math.round((rgb1[0] + rgb2[0]) / 2),
			Math.round((rgb1[1] + rgb2[1]) / 2),
			Math.round((rgb1[2] + rgb2[2]) / 2)
		];

		// Convert blended RGB values to hexadecimal format
		var blendedHex = rgbToHex(blendedRgb[0], blendedRgb[1], blendedRgb[2]);

		return blendedHex;
	}

	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	var ordersRowMarginTop = 5
	var cardSlotOutlineHeight = 4

	var beltSegmentZIndex = 1000000
	var beltZIndex = 2
	var elementZIndex = beltZIndex + 1

	var beltSegmentsPerRow = 8;
	var beltSegmentOffset = standardRowHeight/beltSegmentsPerRow
	var beltSegmentHeight = beltSegmentOffset + 2
	var beltSegmentWidth = 40

	function versionToClassArray(version) {
		var versionAsStrinng = version.toString()
		var versionPieces = versionAsStrinng.split(".")
		var mainVersionPiece = versionPieces[0]
		var mainVersionClass = "version" + mainVersionPiece
		if (versionPieces.length > 1) {
			var subVersionPiece = versionPieces[1]
			var subVersionClass = "subversion" + subVersionPiece
			return [mainVersionClass, subVersionClass]
		}
		return [mainVersionClass]
	}

	function setIsDemoBoard(idb) {
		isDemoBoard = idb
	}

    // This returned object becomes the defined value of this module
    return {
		slotWidth: slotWidth,
		beltCenterOffsetInTile: beltCenterOffsetInTile,
		standardRowHeight: standardRowHeight,
		elementHeight: elementHeight,
		elementWidth: elementWidth,
		elementTopAndBottomMargin: elementTopAndBottomMargin,
		elementLeftAndRightMargin: elementLeftAndRightMargin,
		crossTileWidth: crossTileWidth,
		crossTileHeight: crossTileHeight,
		crossTileBorder: crossTileBorder,
		crossTileInnerWidth: crossTileInnerWidth,
		beltSegmentZIndex: beltSegmentZIndex,
		beltSegmentsPerRow: beltSegmentsPerRow,
		beltSegmentOffset: beltSegmentOffset,
		beltSegmentHeight: beltSegmentHeight,
		beltSegmentWidth: beltSegmentWidth,


		version003: version003,
		version004: version004,
		version004_01: version004_01,

		nutTypeAlmond: nutTypeAlmond,
		nutTypeCashew: nutTypeCashew,
		nutTypePeanut: nutTypePeanut,
		nutTypePistachio: nutTypePistachio,
		nutTypeWalnut: nutTypeWalnut,

		cardHeight: cardHeight,
		cardWidth: cardWidth,
		cardBackFontSize: cardBackFontSize,

		nutTypesByVersion: nutTypesByVersion,
		nutTypeImages: nutTypeImages,

		saltedTypes: saltedTypes,
		numSaltedTypes: saltedTypes.length,
		saltedTypeImages: saltedTypeImages,

		roastedTypes: roastedTypes,
		numRoastedTypes: roastedTypes.length,
		roastedTypeImages: roastedTypeImages,

		wildImage: wildImage,
		ordersRowMarginTop: ordersRowMarginTop,
		cardSlotOutlineHeight: cardSlotOutlineHeight,
		elementZIndex: elementZIndex,
		beltZIndex: beltZIndex,
		crossTileOnBoardLeftMargin: crossTileOnBoardLeftMargin,
		crossTileOnBoardTopMargin: crossTileOnBoardTopMargin,

		addDiv: addDiv,
		addImage: addImage,
		addPageOfItems: addPageOfItems,
		addRow: addRow,
		addCard: addCard,
		blendHexColors: blendHexColors,
		getRandomInt: getRandomInt,
		versionToClassArray: versionToClassArray,
		setIsDemoBoard: setIsDemoBoard,
		getIsDemoBoard: function() {
			return isDemoBoard
		},
		extendOptClassArray: extendOptClassArray,
		makeSlotId: makeSlotId,
		getElementId: getElementId,
	};
});