define([
	'dojo/dom-construct',
	'dojo/domReady!'
], function(domConstruct) {
	var pageNumber = 0
	var cardHeight = 336
	var cardWidth = 240

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


	var saltedImages = [
		"images/Order/Order.Wild.png",
		"images/NutProps/Salted.Y.png",
		"images/NutProps/Salted.Y.png",
	]
	var roastedImages = [
		"images/Order/Order.Wild.png",
		"images/NutProps/Roasted.Y.png",
		"images/NutProps/Roasted.Y.png",
	]
	var nutTypeImages = [
		"images/Order/Order.Wild.png",
		"images/NutProps/Nut.Peanut.png",
		"images/NutProps/Nut.Almond.png",
	]

	function addNoOnTop(textContent, extraClass) {
		var extra = `<div class="no ${extraClass}"><div class="no_slash"></div></div>`
		return textContent + extra
	}

	function addNutDesc(parent, salted, roasted, nutType) {
		var saltedImage = saltedImages[salted]
		var roastedImage = roastedImages[roasted]
		var nutTypeImage = nutTypeImages[nutType]

		var content = `<img class="nut_image" alt="" src="${nutTypeImage}" title=""><img class="salted_image" alt="" src="${saltedImage}" title=""><img class="roasted_image" alt="" src="${roastedImage}" title="">`

		if (salted == 2) {
			content = addNoOnTop(content, "salted_image")
		}
		if (roasted == 2) {
			content = addNoOnTop(content, "roasted_image")
		}

		var nutDescNode = addDiv(parent, "nutDesc", "nutDesc", content)
		return nutDescNode
	}

    // This returned object becomes the defined value of this module
    return {
		addDiv: addDiv,
		addImage: addImage,
		addPage: addPage,
		blendHexColors: blendHexColors,
		getRandomInt: getRandomInt,
		addNutDesc: addNutDesc,
		cardHeight: cardHeight,
		cardWidth: cardWidth,
	};
});