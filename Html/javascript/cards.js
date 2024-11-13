define([
	'dojo/string',
    'dojo/dom',
	'javascript/gameUtils',
	'dojo/dom-style',
	'dojo/domReady!'
], function(string, dom, gameUtils, domStyle){

	var cardsPerPage = 16
	var cardBorderWidth = 5

	function setCardSize(node) {
		domStyle.set(node, {
			"width": `${gameUtils.cardWidth}px`,
			"height": `${gameUtils.cardHeight}px`,
			"border": `${cardBorderWidth}px solid #000`,
		})
	}

	function addCardBack(parent, title, color, opt_classArray) {
		var classArray = gameUtils.extendOptClassArray(opt_classArray, "back")

		var node = gameUtils.addCard(parent, classArray, "back")

		setCardSize(node)

		var innerNode = gameUtils.addDiv(node, ["inset"], "inset")
		var otherColor = gameUtils.blendHexColors(color, "#ffffff")
		var gradient = string.substitute('radial-gradient(${color1}, ${color2})', {
			color1: otherColor,
			color2: color,
		})
		domStyle.set(innerNode, "background", gradient)
		var title = gameUtils.addDiv(innerNode, ["title"], "title", title)
		var style = {}
		style["font-size"] = `${gameUtils.cardBackFontSize}px`
		domStyle.set(title, style)

		return node
	}

	function addCardFront(parent, classArray, id) {
		classArray.push("front")
		var node = gameUtils.addCard(parent, classArray, id)
		setCardSize(node)

		return node
	}

	function addNutDesc(parent, nutType) {
		var wrapper = gameUtils.addDiv(parent, ["wrapper"], "wrapper")
		var nutPropsTopNode = gameUtils.addDiv(wrapper, ["nutProps"], "nutProps")

		var nutTypeImage = nutType == -1 ? gameUtils.wildImage: gameUtils.nutTypeImages[nutType]

		var prop = gameUtils.addDiv(nutPropsTopNode, ["nutProp", "nutType"], "nutType")
		gameUtils.addImage(prop, ["nutType"], "nutType", nutTypeImage)
		return wrapper
	}

	function addOrderCardSingleNut(parent, nutType, index, opt_classArray) {
		var classArray = gameUtils.extendOptClassArray(opt_classArray, "order")
		var cardId = "order.".concat(index.toString())
		var node = addCardFront(parent, classArray, cardId)
		addNutDesc(node, nutType)
		return node
	}

	function addNthOrderCardSingleNut(parent, version, index, numOrderCardsEachType, opt_classArray) {
		var nutTypeIndex = Math.floor(index/numOrderCardsEachType)
		var nutTypes = gameUtils.nutTypesByVersion[version]
		var nutType = nutTypes[nutTypeIndex]

		return addOrderCardSingleNut(parent, nutType, index, opt_classArray)
	}

    // This returned object becomes the defined value of this module
    return {
		addNthOrderCardSingleNut:addNthOrderCardSingleNut,
		addOrderCardSingleNut: addOrderCardSingleNut,

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

		addCardFront: addCardFront,

		addCards: function (title, color, numCards, contentCallback, opt_classArray) {
            var bodyNode = dom.byId("body");

			var pageOfFronts
			var pageOfBacks

			for (let i = 0; i < numCards; i++) {
				if (i % cardsPerPage == 0) {
					pageOfFronts = gameUtils.addPageOfItems(bodyNode)
					pageOfBacks = gameUtils.addPageOfItems(bodyNode, ["back"])
				}
				addCardBack(pageOfBacks, title, color, opt_classArray)
				contentCallback(pageOfFronts, i, opt_classArray)
			}
        },
    };
});