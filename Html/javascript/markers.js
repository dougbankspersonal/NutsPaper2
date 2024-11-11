define([
	'dojo/string',
    'dojo/dom',
	'javascript/gameUtils',
	'dojo/dom-style',
	'dojo/domReady!'
], function(string, dom, gameUtils, domStyle){

	var markerTypes = {
		Almond: gameUtils.nutTypeAlmond,
		Cashew: gameUtils.nutTypeCashew,
		Peanut: gameUtils.nutTypePeanut,
		Pistachio: gameUtils.nutTypePistachio,
		Salter: "Salter",
		Squirrel: "Squirrel",
		SquirrelHunger: "SquirrelHunger",
		StartingPlayer: "StartingPlayer",
	}

	imagesByType = {}
	imagesByType[markerTypes.Almond] = "images/Markers/Simple.Almond.png"
	imagesByType[markerTypes.Cashew] = "images/Markers/Simple.Cashew.png"
	imagesByType[markerTypes.Peanut] = "images/Markers/Simple.Peanut.png"
	imagesByType[markerTypes.Pistachio] = "images/Markers/Simple.Pistachio.png"
	imagesByType[markerTypes.Salter] = "images/Markers/Simple.Salter.png"
	imagesByType[markerTypes.Squirrel] = "images/Markers/Simple.Squirrel.png"

	var shrinkage = 3
	var markersPerPage = 42

	function makeMarker(parent, markerType, opt_classArray, opt_additionalConfig) {
		var classArray = gameUtils.extendOptClassArray(opt_classArray, "marker")
		classArray.push(markerType)
		var additionalConfig = opt_additionalConfig ? opt_additionalConfig: {}
		var node = gameUtils.addDiv(parent, classArray, "marker.".concat(markerType))
		domStyle.set(node, {
			"width": `${gameUtils.elementWidth - shrinkage}px`,
			"height": `${gameUtils.elementHeight - shrinkage}px`,
		})

		var image = imagesByType[markerType]
		if (image) {
			gameUtils.addImage(node, ["image"], "image", image)
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
		makeMarker: makeMarker,
		makeMarkers: function (numMarkers, contentCallback) {
            var bodyNode = dom.byId("body");
			var pageOfMarkers = null
			for (var i = 0; i < numMarkers; i++) {
				if (i % markersPerPage == 0) {
					pageOfMarkers = gameUtils.addPageOfItems(bodyNode)
				}
				contentCallback(pageOfMarkers, i)
			}
        },
    };
});