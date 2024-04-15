define([
    'dojo/dom',
	'javascript/gameUtils',
	'dojo/domReady!'
], function(dom, gameUtils) {

	var nutTypes = [1, 2]
	var saltedTypes = [1, 2]
	var roastedTypes = [1, 2]

	numNutsPerType = 30
	numNutsPerPage = 120

	return {
		makeTokens: function () {

			var bodyNode = dom.byId("body");

			var pageOfFronts
			var pageOfBacks

			totalCount = 0
			for (nutType of nutTypes) {
				for (salted of saltedTypes) {
					for (roasted of roastedTypes) {
						if (totalCount % numNutsPerPage == 0) {
							if (pageOfFronts && pageOfBacks)
							{
								gameUtils.addDiv(pageOfFronts, 'label', 'label', "front")
								gameUtils.addDiv(pageOfBacks, 'label', 'label', "back")
							}
							pageOfFronts = gameUtils.addPage(bodyNode, "tokens")
							pageOfBacks = gameUtils.addPage(bodyNode, "tokens back")
						}

						var frontBlock = gameUtils.addDiv(pageOfFronts, "nutBlock", "nutBlock")
						var backBlock = gameUtils.addDiv(pageOfBacks, "nutBlock", "nutBlock")

						for (let i = 0; i < numNutsPerType; i++) {
							gameUtils.addNutDesc(frontBlock, salted, roasted, nutType)
							gameUtils.addNutDesc(backBlock, salted, roasted, nutType)
							totalCount++
						}
					}
				}
			}
		},
	}
})