define([
	'dojo/string',
    'dojo/dom',
	'javascript/gameUtils',
	'dojo/dom-style',
	'dojo/domReady!'
], function(string, dom, gameUtils, domStyle){

	var cardsPerPage = 8

	function makeCardBack(parent, title, color, opt_extraClass) {
		if (!opt_extraClass) {
			opt_extraClass = ""
		}
		var otherColor = gameUtils.blendHexColors(color, "#ffffff")
		var node = gameUtils.addDiv(parent, `card back ${opt_extraClass}`, "back")

		domStyle.set(node, {
			"width": `${gameUtils.cardWidth}px`,
			"height": `${gameUtils.cardHeight}px`,
		})

		var innerNode = gameUtils.addDiv(node, "inset", "inset")
		var gradient = string.substitute('radial-gradient(${color1}, ${color2})', {
			color1: otherColor,
			color2: color,
		})
		domStyle.set(innerNode, "background", gradient)
		var title = gameUtils.addDiv(innerNode, "title", "title", title)
		return node
	}

    // This returned object becomes the defined value of this module
    return {
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

		makeCardFront: function(parent, classes, id) {
			var classes = "card front " + classes
			var node = gameUtils.addDiv(parent, classes, id)
			domStyle.set(node, {
				"width": `${gameUtils.cardWidth}px`,
				"height": `${gameUtils.cardHeight}px`,
			})
			return node
		},

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
					pageOfFronts = gameUtils.addPage(bodyNode)
					pageOfBacks = gameUtils.addPage(bodyNode, "back")
				}
				makeCardBack(pageOfBacks, title, color, opt_extraClass)
				contentCallback(pageOfFronts, i, opt_extraClass)
			}
        },
    };
});