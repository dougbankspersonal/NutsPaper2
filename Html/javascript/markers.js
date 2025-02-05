define([
    'dojo/dom',
	'javascript/gameUtils',
	'dojo/dom-style',
	'dojo/domReady!'
], function(dom, gameUtils, domStyle){

	var markerTypes = {
		Almond: gameUtils.nutTypeAlmond,
		Cashew: gameUtils.nutTypeCashew,
		Peanut: gameUtils.nutTypePeanut,
		Pistachio: gameUtils.nutTypePistachio,
		Salter: "Salter",
		Squirrel: "Squirrel",
		StartingPlayer: "StartingPlayer",

		// For demo.
		Heart: "Heart",
		Skull: "Skull",
		Star: "Star",
	}

	console.log("Doug: gameUtils.nutTypeAlmond = ", gameUtils.nutTypeAlmond)

	var shrinkage = 3
	var markersPerPage = 42

	function addMarker(parent, markerType, opt_classArray, opt_additionalConfig) {
		var classArray = gameUtils.extendOptClassArray(opt_classArray, "marker")
		classArray.push(markerType)
		var additionalConfig = opt_additionalConfig ? opt_additionalConfig: {}
		var node = gameUtils.addDiv(parent, classArray, "marker.".concat(markerType))
		domStyle.set(node, {
			"width": `${gameUtils.elementWidth - shrinkage}px`,
			"height": `${gameUtils.elementHeight - shrinkage}px`,
			"z-index": `${gameUtils.markerZIndex}`,
		})

		if (image) {
			gameUtils.addImage(node, ["image", markerType], "image")
		}

		var text = additionalConfig.text ? additionalConfig.text: null

		if (text) {
			gameUtils.addDiv(node, ["text"], "text", text)
		}

		if (additionalConfig.color) {
			domStyle.set(node, "background-color", additionalConfig.color)
		}

		return node
	}

    // This returned object becomes the defined value of this module
    return {
		markerTypes: markerTypes,
		addMarker: addMarker,
		addMarkers: function (numMarkers, contentCallback) {
            var bodyNode = dom.byId("body");
			var pageOfMarkers = null
			for (var i = 0; i < numMarkers; i++) {
				if (i % markersPerPage == 0) {
					pageOfMarkers = gameUtils.addPageOfItems(bodyNode)
				}
				contentCallback(pageOfMarkers, i)
			}
        },
    }
})