define([
	'dojo/dom-construct',
	'dojo/domReady!'
], function(domConstruct) {
	var pageNumber = 0
	var rowNumber = 0

	var cardHeight = 336
	var cardWidth = 240

	var smallCardHeight = 0.666 * cardHeight
	var smallCardWidth = 0.666 * cardWidth

	var version003 = 3
	var version004 = 4
	var version004_01 = 4.01

	var nutTypeAlmond = "Almond"
	var nutTypeCashew = "Cashew"
	var nutTypePeanut = "Peanut"
	var nutTypePistachio = "Pistachio"
	var nutTypeWalnut = "Walnut"

	var pageAllowsOverflow = false
	var rowAllowsOverflow = false

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

	function addDiv(parent, className, id, opt_innerHTML = "") {
		var node = domConstruct.create("div", {
			innerHTML: opt_innerHTML,
			className: className,
			id: id
		}, parent)
		return node
	}

	function addImage(parent, className, id, image) {
		var node = domConstruct.create("img", {
			innerHTML: "",
			className: className,
			id: id,
			src: image
		}, parent)
		return node
	}

	function addPageOfItems(parent, opt_extraClass = "") {
		var pageId = "pageOfItems.".concat(pageNumber.toString())
		pageNumber++
		var classes = "pageOfItems"
		if (pageAllowsOverflow) {
			classes = classes + " allowsOverflow"
		}
		if (opt_extraClass != "") {
			classes = classes + " " + opt_extraClass
		}
		return addDiv(parent, classes, pageId)
	}

	function addRow(parent, opt_classes, opt_id) {
		var classes = "row"
		if (opt_classes) {
			classes = classes + " " + opt_classes
		}
		if (rowAllowsOverflow) {
			classes = classes + " allowsOverflow"
		}

		var rowId
		if (opt_id) {
			rowId = opt_id
		} else {
			rowId = "row.".concat(rowNumber.toString())
			rowNumber++
		}
		return addDiv(parent, classes, rowId)
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

	var slotWidth = 240
	var horizontalSpaceBetweenSlots = 10

	// Visual aid for all this:
	// Total width of slot:
	// +-a-+-----b-----+-a-+
	// Where a is horizontalSpaceBetweenSlots/2 and b slotWidth.
	var totalSlotWidth = slotWidth + horizontalSpaceBetweenSlots

	// A belt comes in the middle of a slot:
	// So from far left that's a + b/2
	// From the Tile's left edge, call that x.
	// Then x + g = a + b/2.
	// x = a + b/2 - g
	// = horizontalSpaceBetweenSlots/2 + slotWidth/2 - crossTileHorizontalInset
	var crossTileVerticalInset = 10
	var crossTileHorizontalInset = 20
	var beltCenterOffsetInTile = horizontalSpaceBetweenSlots/2 + slotWidth/2 - crossTileHorizontalInset

	var standardRowHeight = 140;
	var elementHeight = standardRowHeight - 20

	// For a cross tile, it lays across two side by side slots:
	//
	// Slots: +-a-+-----b-----+-a-+-a-+-----b-----+-a-+
	// Tile : +--g--+-------------h-------------+--g--+
	// Where h is crossTileWidth and g is crossTileHorizontalInset.
	// So...
	var crossTileWidth = totalSlotWidth * 2 - 2 * crossTileHorizontalInset
	var crossTileHeight = standardRowHeight - 2 * crossTileVerticalInset

	var beltSegmentZIndex = 0

	var beltSegmentsPerRow = 8;
	var beltSegmentOffset = standardRowHeight/beltSegmentsPerRow
	var beltSegmentHeight = beltSegmentOffset + 2
	var beltSegmentWidth = 40

	function versionToCssFriendlyString(version) {
		return "version" + version.toString().replace(".", "_")
	}

	function setPageAllowsOverflow(pao) {
		pageAllowsOverflow = pao
	}

	function setRowAllowsOverflow(rao) {
		rowAllowsOverflow = rao
	}

    // This returned object becomes the defined value of this module
    return {
		slotWidth: slotWidth,
		horizontalSpaceBetweenSlots: horizontalSpaceBetweenSlots,
		beltCenterOffsetInTile: beltCenterOffsetInTile,
		standardRowHeight: standardRowHeight,
		elementHeight: elementHeight,
		crossTileWidth: crossTileWidth,
		crossTileHeight: crossTileHeight,
		beltSegmentZIndex: beltSegmentZIndex,
		beltSegmentsPerRow: beltSegmentsPerRow,
		beltSegmentOffset: beltSegmentOffset,
		beltSegmentHeight: beltSegmentHeight,
		beltSegmentWidth: beltSegmentWidth,


		version003: version003,
		version004: version004,
		version004_01: version004_01,

		versionToCssFriendlyString: versionToCssFriendlyString,

		nutTypeAlmond: nutTypeAlmond,
		nutTypeCashew: nutTypeCashew,
		nutTypePeanut: nutTypePeanut,
		nutTypePistachio: nutTypePistachio,
		nutTypeWalnut: nutTypeWalnut,

		addDiv: addDiv,
		addImage: addImage,
		addPageOfItems: addPageOfItems,
		addRow: addRow,
		blendHexColors: blendHexColors,
		getRandomInt: getRandomInt,
		cardHeight: cardHeight,
		cardWidth: cardWidth,

		smallCardHeight: smallCardHeight,
		smallCardWidth: smallCardWidth,

		nutTypesByVersion: nutTypesByVersion,
		nutTypeImages: nutTypeImages,

		saltedTypes: saltedTypes,
		numSaltedTypes: saltedTypes.length,
		saltedTypeImages: saltedTypeImages,

		roastedTypes: roastedTypes,
		numRoastedTypes: roastedTypes.length,
		roastedTypeImages: roastedTypeImages,

		wildImage: wildImage,

		setPageAllowsOverflow: setPageAllowsOverflow,
		setRowAllowsOverflow: setRowAllowsOverflow,
	};
});