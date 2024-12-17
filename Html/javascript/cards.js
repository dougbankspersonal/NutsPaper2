define([
	'dojo/string',
    'dojo/dom',
	'javascript/gameUtils',
	'dojo/dom-style',
	'dojo/domReady!'
], function(string, dom, gameUtils, domStyle){

	var adjustedPageWidth = gameUtils.printedPageWidth - 2 * gameUtils.pagePadding
	var adjustedPageHeight = gameUtils.printedPageHeight - 2 * gameUtils.pagePadding
	var cardFitHorizontally = Math.floor(adjustedPageWidth / gameUtils.cardWidth)
	var cardFitVertically = Math.floor(adjustedPageHeight / gameUtils.cardHeight)

	var bigCardFitHorizontally = Math.floor(adjustedPageWidth / gameUtils.bigCardWidth)
	var bigCardFitVertically = Math.floor(adjustedPageHeight / gameUtils.bigCardHeight)

	var cardsPerPage = cardFitHorizontally * cardFitVertically
	var bigCardsPerPage = bigCardFitHorizontally * bigCardFitVertically

	console.log("Doug: cardsPerPage: ", cardsPerPage)
	console.log("Doug: cardFitHorizontally: ", cardFitHorizontally)
	console.log("Doug: gameUtils.printedPageWidth: ", gameUtils.printedPageWidth)
	console.log("adjustedPageWidth: ", adjustedPageWidth)
	console.log("Doug: gameUtils.pagePadding: ", gameUtils.pagePadding)
	console.log("Doug: gameUtils.cardWidth: ", gameUtils.cardWidth)

	var ttsCardsPerPage = 70

	function setCardSize(node, configs) {
		if (configs.bigCards) {
			domStyle.set(node, {
				"width": `${gameUtils.bigCardWidth}px`,
				"height": `${gameUtils.bigCardHeight}px`,
			})
		}
		else
		{
			domStyle.set(node, {
				"width": `${gameUtils.cardWidth}px`,
				"height": `${gameUtils.cardHeight}px`,
			})
		}
	}

	function addCardBack(parent, title, color, opt_configs) {
		var configs = opt_configs ? opt_configs : {}
		var node = gameUtils.addCard(parent, ["back"], "back")

		setCardSize(node, configs)

		var innerNode = gameUtils.addDiv(node, ["inset"], "inset")
		var otherColor = gameUtils.blendHexColors(color, "#ffffff")
		var gradient = string.substitute('radial-gradient(${color1}, ${color2})', {
			color1: otherColor,
			color2: color,
		})
		domStyle.set(innerNode, "background", gradient)
		var title = gameUtils.addDiv(innerNode, ["title"], "title", title)
		var style = {}
		style["font-size"] = configs.bigCards ? `${gameUtils.bigCardBackFontSize}px`: `${gameUtils.cardBackFontSize}px`
		domStyle.set(title, style)

		return node
	}

	function addCardFront(parent, classArray, id) {
		var configs = gameUtils.getConfigs()
		classArray.push("front")
		var node = gameUtils.addCard(parent, classArray, id)
		setCardSize(node, configs)

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

	function addNthOrderCardSingleNut(parent, index, numOrderCardsEachType, opt_classArray) {
		var nutTypeIndex = Math.floor(index/numOrderCardsEachType)
		var nutTypes = gameUtils.nutTypes
		var nutType = nutTypes[nutTypeIndex]

		return addOrderCardSingleNut(parent, nutType, index, opt_classArray)
	}

	function addCards(title, color, numCards, contentCallback, opt_configs) {
		var bodyNode = dom.byId("body");
		var configs = opt_configs ? opt_configs : {}
		gameUtils.setConfigs(configs)

		var pageOfFronts
		var pageOfBacks

		var timeForNewPageDivisor
		if (configs.ttsCards) {
			timeForNewPageDivisor = ttsCardsPerPage
		} else if (configs.bigCards) {
			timeForNewPageDivisor = bigCardsPerPage
		} else {
			timeForNewPageDivisor = cardsPerPage
		}

		for (let i = 0; i < numCards; i++) {
			var timeForNewPage = i % timeForNewPageDivisor
			if (timeForNewPage == 0) {
				pageOfFronts = gameUtils.addPageOfItems(bodyNode)
			}
			contentCallback(pageOfFronts, i)
		}
		if (!configs.ttsCards)
		{
			for (let i = 0; i < numCards; i++) {
				var timeForNewPage = i % timeForNewPageDivisor
				if (timeForNewPage == 0) {
					pageOfBacks = gameUtils.addPageOfItems(bodyNode, ["back"])
				}
				addCardBack(pageOfBacks, title, color, configs)
			}
		}
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

		addCards: addCards,
    }
});