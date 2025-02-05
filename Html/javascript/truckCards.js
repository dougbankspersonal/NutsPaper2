define([
	'javascript/gameUtils',
	'javascript/cards',
	'dojo/domReady!',
], function(gameUtils, cards) {

	function addTruckDesc(parent, config) {
        if (config.title) {
            var node = gameUtils.addDiv(parent, ["title"], "title")
            node.innerHTML = config.title
        }
        if (config.capacity) {
            var node = gameUtils.addDiv(parent, ["capacity"], "capacity")
            node.innerHTML = config.capacity
        }
        if (config.reward) {
            var node = gameUtils.addDiv(parent, ["reward"], "reward")
            node.innerHTML = config.reward
        }
	}

	function addNthTruckCard(parent, index, truckCardDescs)
	{
		var classArray = ["truck"]
		var cardId = "truck.".concat(index.toString())
		var node = cards.addCardFront(parent, classArray, cardId)
		var index = index % truckCardDescs.length
		var truckDesc = truckCardDescs[index]
		addTruckDesc(node, truckDesc)
		return node
	}


    // This returned object becomes the defined value of this module
    return {
		addNthTruckCard: addNthTruckCard,
	};
});