define([
	'dojo/dom-construct',
	'dojo/domReady!'
], function(domConstruct) {
	var pageNumber = 0
	var cardHeight = 336
	var cardWidth = 240

	var nutTypesByVersion = {
		"v003": [
			"Peanut",
			"Almond",
		],
		"v004": [
			"Peanut",
			"Almond",
			"Walnut",
			"Pistachio",
		],
	}

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
	var nutTypeImages = [
		"images/NutProps/Simple.Peanut.png",
		"images/NutProps/Simple.Almond.png",
		"images/NutProps/Simple.Walnut.png",
		"images/NutProps/Simple.Pistachio.png",
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

	function addPage(parent, opt_extraClass = "") {
		var pageId = "page.".concat(pageNumber.toString())
		pageNumber++
		var c = "page_of_items"
		if (opt_extraClass != "") {
			c = c + " " + opt_extraClass
		}
		var node = addDiv(parent, c, pageId)
		return node
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

    // This returned object becomes the defined value of this module
    return {
		addDiv: addDiv,
		addImage: addImage,
		addPage: addPage,
		blendHexColors: blendHexColors,
		getRandomInt: getRandomInt,
		cardHeight: cardHeight,
		cardWidth: cardWidth,

		nutTypesByVersion: nutTypesByVersion,
		nutTypeImages: nutTypeImages,

		saltedTypes: saltedTypes,
		numSaltedTypes: saltedTypes.length,
		saltedTypeImages: saltedTypeImages,

		roastedTypes: roastedTypes,
		numRoastedTypes: roastedTypes.length,
		roastedTypeImages: roastedTypeImages,

		wildImage: wildImage,
	};
});