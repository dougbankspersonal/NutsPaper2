define([
	'dojo/string',
    'dojo/dom',
	'javascript/gameUtils',
	'dojo/dom-style',
	'dojo/domReady!'
], function(string, dom, gameUtils, domStyle){

	var cardsPerPage = 8
	var cardBorderWidth = 5

	function setCardSize(node, classes) {
		if (classes && classes.indexOf("small") != -1) {
			domStyle.set(node, {
				"width": `${gameUtils.smallCardWidth}px`,
				"height": `${gameUtils.smallCardHeight}px`,
				"border": `${cardBorderWidth}px solid #000`,
			})
		}
		else
		{
			domStyle.set(node, {
				"width": `${gameUtils.cardWidth}px`,
				"height": `${gameUtils.cardHeight}px`,
				"border": `${cardBorderWidth}px solid #000`,
			})
		}
	}

	function makeCardBack(parent, title, color, opt_extraClass) {
		var classes = opt_extraClass
		if (!classes) {
			classes = ""
		}
		var otherColor = gameUtils.blendHexColors(color, "#ffffff")
		var node = gameUtils.addDiv(parent, `card back ${classes}`, "back")

		setCardSize(node, classes)

		var innerNode = gameUtils.addDiv(node, "inset", "inset")
		var gradient = string.substitute('radial-gradient(${color1}, ${color2})', {
			color1: otherColor,
			color2: color,
		})
		domStyle.set(innerNode, "background", gradient)
		var title = gameUtils.addDiv(innerNode, "title", "title", title)
		return node
	}

	function makeCardFront(parent, classes, id) {
		var classes = "card front " + classes
		var node = gameUtils.addDiv(parent, classes, id)
		setCardSize(node, classes)

		return node
	}

	function addNutDesc(parent, nutType) {
		console.log("Doug: addNutDesc ", parent, nutType)
		var wrapper = gameUtils.addDiv(parent, "wrapper", "wrapper")
		console.log("Doug: addNutDesc ", wrapper)
		var nutPropsTopNode = gameUtils.addDiv(wrapper, "nutProps", "nutProps")
		gameUtils.addDiv(wrapper, "nutProps standardMargin", "nutProps")

		var nutTypeImage = nutType == -1 ? gameUtils.wildImage: gameUtils.nutTypeImages[nutType]

		var prop = gameUtils.addDiv(nutPropsTopNode, "nutProp nutType", "nutType")
		gameUtils.addImage(prop, "nutType", "nutType", nutTypeImage)
		return wrapper
	}

	function makeOrderCardSingleNut(parent, nutType, index, opt_classes) {
		console.log("Doug: makeOrderCardSingleNut ", parent, nutType, index, opt_classes)
		var classes = opt_classes ? opt_classes: ""
		var cardId = "order.".concat(index.toString())
		var cardClasses = `order ${classes}`
		var node = makeCardFront(parent, cardClasses, cardId)
		console.log("Doug: makeOrderCardSingleNut ", node, nutType)
		addNutDesc(node, nutType)
		return node
	}

	function makeNthOrderCardSingleNut(version, parent, index, numOrderCardsEachType, opt_classes) {
		var nutTypeIndex = Math.floor(index/numOrderCardsEachType)
		var nutTypes = gameUtils.nutTypesByVersion[version]
		var nutType = nutTypes[nutTypeIndex]

		return makeOrderCardSingleNut(parent, nutType, index, opt_classes)
	}

    // This returned object becomes the defined value of this module
    return {
		makeNthOrderCardSingleNut: makeNthOrderCardSingleNut,
		makeOrderCardSingleNut: makeOrderCardSingleNut,

		getCardDescAtIndex: function(index, descs)
		{
			var count = 0
			for (key in descs) {
				var cardDesc = descs[key]
				var contribution = cardDesc.number ? cardDesc.number : 1
				count = count + contribution
				if (index < count) {
					return cardDesc
				}
			}
			return null
		},

		makeCardFront: makeCardFront,

		makeCards: function (title, color, numCards, contentCallback, opt_extraClass) {
            var bodyNode = dom.byId("body");

			var pageOfFronts
			var pageOfBacks

			if (opt_extraClass == "small")
			{
				cardsPerPage = 16
			}

			for (let i = 0; i < numCards; i++) {
				if (i % cardsPerPage == 0) {
					pageOfFronts = gameUtils.addPageOfItems(bodyNode)
					pageOfBacks = gameUtils.addPageOfItems(bodyNode, "back")
				}
				makeCardBack(pageOfBacks, title, color, opt_extraClass)
				contentCallback(pageOfFronts, i, opt_extraClass)
			}
        },
    };
});