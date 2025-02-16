define([
    'dojo/dom',
	'dojo/dom-style',
	'javascript/gameUtils',
	'dojo/domReady!'
], function(dom, domStyle, gameUtils){

    var warehouseCellPaddingPx = 3

    var boxWidthPx = 120
    var boxHeightPx = boxWidthPx/2
    var cellWidthPx = boxWidthPx + warehouseCellPaddingPx
    var cellHeightPx = boxHeightPx + warehouseCellPaddingPx

    var cellsPerRow = 7
    var cellsPerColumn = 11

    var nutTypeDistribution = null
    var imagePaddingPx = 5
    var imageSizePx = cellHeightPx - 2 * imagePaddingPx

    function getRandomNutTypeIndex() {
        var numNutTypes = gameUtils.nutTypes.length
        if (nutTypeDistribution == null) {
            nutTypeDistribution = []
            var nutsPerType = Math.ceil((cellsPerRow * cellsPerColumn / 2) / numNutTypes)
            for (var i = 0; i < numNutTypes; i++) {
                nutTypeDistribution.push(nutsPerType)
            }
        }

        while (true) {
            var nutTypeIndex = Math.floor(Math.random() * numNutTypes)
            var nutTypeCount = nutTypeDistribution[nutTypeIndex]
            if (nutTypeCount != 0) {
                nutTypeDistribution[nutTypeIndex] = nutTypeCount - 1
                return gameUtils.nutTypes[nutTypeIndex]
            }
        }
    }

    function addNutIcon(parent) {
        var numTypeIndex = getRandomNutTypeIndex()
        var nutType = gameUtils.nutTypes[numTypeIndex]
		console.log("Doug: 004 nutType = ", nutType)
        var image = gameUtils.addImage(parent, "nutType", ["nutType", nutType])
        domStyle.set(image, {
            width: `${imageSizePx}px`,
            height: `${imageSizePx}px`,
        })
        return image
    }

    function addStarIcon(parent) {
        var image = gameUtils.addImage(parent, "star", ["star"], gameUtils.starImage)
        domStyle.set(image, {
            width: `${imageSizePx}px`,
            height: `${imageSizePx}px`,
        })
        return image
    }

    function addSaltIcon(parent) {
        var image = gameUtils.addImage(parent, "salt", ["salt"], "images/Markers/Salter.png")
        domStyle.set(image, {
            width: `${imageSizePx * 0.6}px`,
            height: `${imageSizePx * 0.6}px`,
        })
        return image
    }

    function addGrid(parent) {
        var totalCount = 0
        var wrapper = gameUtils.addDiv(parent, ["wrapper", "grid"], "wrapper")
        for (var i = 0; i < cellsPerColumn; i++) {
            var row = gameUtils.addDiv(wrapper, ["row"], "row")
            for (var j = 0; j < cellsPerRow; j++) {
                var cell = gameUtils.addDiv(row, ["cell"], "cell")
                domStyle.set(cell, {
                    "width": `${cellWidthPx}px`,
                    "height": `${cellHeightPx}px`,
                })
                if (totalCount == Math.floor((cellsPerRow * cellsPerColumn -1) /2)) {
                    addStarIcon(cell)
                } else {
                    if (totalCount %2 == 0) {
                        if (rand == 0) {
                            addSaltIcon(cell)
                         }
                         var nutIcon = addNutIcon(cell)
                        var rand = Math.floor(Math.random() * 4);
                    }
                }

                totalCount = totalCount + 1
            }
        }
    }

    function createWarehouse() {
        var bodyNode = dom.byId("body");
        var pageOfItems = gameUtils.addPageOfItems(bodyNode, ["warehouse"])
        addGrid(pageOfItems)
    }
    return {
		createWarehouse: createWarehouse,
    };
});