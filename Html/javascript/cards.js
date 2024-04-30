define([
	'dojo/dojo',
	'dojo/string',
    'dojo/dom',
	'javascript/gameUtils',
	'dojo/dom-style',
	'dojo/domReady!'
], function(dojo, string, dom, gameUtils, domStyle){

	var cardsPerPage = 6

	// Action Cards
	actionCardDescs = [
		{
			title: "Nut<br>Dispensers",
			action: "Move one Nut Dispenser to any open space on Nut Dispensers row",
		},
		{
			title: "Roasters",
			action: "Move one Roaster to any open space on Roasters row",
		},
		{
			title: "Salters",
			action: "Move one Salter to any open space on Salters row",
		},
		{
			title: "Belt #1",
			action: "Add or remove a Cross tile on Belt #1 row",
		},
		{
			title: "Belt #2",
			action: "Add or remove a Cross tile on Belt #2 row",
		},
		{
			title: "Belt #3",
			action: "Add or remove a Cross tile on Belt #3 row",
		},
		{
			title: "Belt #4",
			action: "Add or remove a Cross tile on Belt #4 row",
		},
	]

	// Power Cards
	var powerCardDescs = [
		{
			title: "Salt Manager",
			power: "Place a Player token on the Salters Row and move a Salter to any open space",
			timing: "Use before you take your normal Action. You may still take your normal Action after this.",
		},
		{
			title: "Head of Roasting",
			power: "Place a Player token on the Roasters Row and move a Salter to any open space",
			timing: "Use before you take your normal Action. You may still take your normal Action after this.",
		},
		{
			title: "Crossing Supervisor",
			power: "Place a Player token on any Cross Tiles Row and add or remove a Cross Tile",
			timing: "Use before you take your normal Action. You may still take your normal Action after this.",
		},
		{
			title: "Nut Dispenser Overseer",
			power: "Place a Player token on the Nut Dispensers Row and move Nut Dispensers to open spaces (2)",
			timing: "Use before you take your normal Action. You may still take your normal Action after this.",
		},
		{
			title: "Head of Orders",
			power: "Pick one Order type (Single, Double, Triple). Search that deck and select any one Order",
			timing: "Use when you would Select a new Order.",
		},
		{
			title: "Squirrel Whisperer",
			power: "Move one Squirrel to any open space",
			timing: "Use immediately after the Squirrels move.",
		},
		{
			title: "Head of Scheduling",
			power: "Place a Player token on the Orders Row and move any of your Orders to any open space",
			timing: "Use before you take your normal Action. You may still take your normal Action after this.",
		},
		{
			title: "VP of Projections",
			power: "Search the Event Deck for any 3 Events. Replace 3 non-Weekend Events with the Events you Selected",
			timing: "Use at the start of a Day.",
		},
		{
			title: "CEO's Nephew",
			power: "You may do an Action on any row where you could normally do an Action, ignoring any Player token that's already on that Row",
			timing: "Use when you would normally take an Action. This is your Action for the Day.",
		},
		{
			title: "Sneaky Weasel",
			power: "You may take switch Player Tokens on any two placed Orders, as long as one of them is Owned by you",
			timing: "Use when you would normally take an Action. This is your Action for the Day.",
		},
		{
			title: "Janitor",
			power: "When a nut lands on one of your Orders and does not match any Slots, collect the corresponding Nut Token.  You may place it on any other Order (yours or someone else's) if it matches.",
			timing: "Use when the factory is running and a non-matching Nut lands on your Order.",
		},
		{
			title: "Sloppy Joe",
			power: "Place a Nut on your Order, ignoring any rules for Matching.",
			timing: "Use when the factory is running and a non-matching Nut lands on your Order.",
		},
	]

	// Agenda Cards
	var agendaCardDescs = [
		{
			title: "The Low-Sodium Lobby",
			flavor: "This radical faction will stop at nothing to eliminate salt from our diets.",
			goal: "$5 for each Unsalted icon on your Shipped Orders",
		},
		{
			title: "Big Salt",
			flavor: "A coalition of the salt vendors of the world.",
			goal: "$5 for each Salted icon on your Shipped Orders",
		},
		{
			title: "The Nature Commune",
			flavor: "Surprisingly wealthy hippies who passionately advocate for eating raw foods.",
			goal: "$5 for each Raw icon on your Shipped Orders",
		},
		{
			title: "The Secret Order of the Flame",
			flavor: "A mysterious cabal dedicated to the use of fire.",
			goal: "$5 for each Roasted icon on your Shipped Orders",
		},
		{
			title: "People who say<br>\"All-mond\"",
			flavor: "The more people are talking about Almonds, the better...",
			goal: "$5 for each Almond icon on your Shipped Orders",
		},
		{
			title: "The Georgia Boosters",
			flavor: "An association of ruthless peanut farmers.",
			goal: "$5 for each Peanut icon on your Shipped Orders",
		},
		{
			title: "The Harbingers of the Nutpocalypse",
			flavor: "These weirdos just hate nuts.",
			goal: "$30 for each Order ruined by Poop.",
		},
		{
			title: "Sisters of Amorphous Uncertainty",
			flavor: "Question lead to bliss.",
			goal: "$2 for each '?' icon on your Shipped Orders",
		},
		{
			title: "Association of OCD Accountants",
			flavor: "They just like things a certain way.",
			goal: "$15 for each of your Shipped Orders with Order number ending in '0' or '5'",
		},
		{
			title: "Wealthy Math Nerds 1",
			flavor: "A Secret Society who likes to see things in sets.",
			goal: "$30 for each set of Single, Double, and Triple Orders in your Shipped Orders",
		},
		{
			title: "Wealthy Math Nerds 2",
			flavor: "A Secret Society who likes to see things in sets.",
			goal: "$30 for each set of 3 same-sized Orders in your Shipped Orders.<br><br>Limit one per size",
		},
		{
			title: "Sons of Uplift",
			flavor: "\"No one should suffer...\"",
			goal: "For each Player, get the total number of Nuts (not Orders!) Shipped<br><br>Find the difference (D) between the highest and lowest numbers<br><br>D < 4: $80<br><br>4 <= D < 9: $40<br><br>D >= 9: $10",
			extraClasses: "tiny",
		},
	]

	// Event Cards
	var eventCardDescs = {
		"neutral": {
			title: "Business as usual",
			flavor: "Another day, another Nut.",
			event: "<div class=neutral>Nothing changes</div>",
			number: 4,
		},
		"squirrelLaxative": {
			title: "Squirrels get into prunes",
			flavor: "Oh no...",
			event: "<div>Add 3 tokens to each Squirrel Tummy</div>",
			number: 2,
		},
		"squirrelAsleep": {
			title: "Squirrels are asleep",
			flavor: "Late night squirrel party has them tuckered out",
			event: "<div>Squirrels do not move or eat Nuts today.</div>",
			number: 2,
		},
		"squirrelReunion": {
			title: "Squirrel family Reunion",
			flavor: "Cousin comes to visit",
			event: "<div>Add a Squirrel (random placement)</div>",
		},
		"squirrelArgument": {
			title: "Squirrel Fight",
			flavor: "They cannot agree on how to roast a ham",
			event: "<div>Remove a Squirrel (random selection)</div>",
		},
		"extraSalty": {
			title: "A visit from Bob Salt",
			flavor: "He really likes to see us salting...",
			event: "<div>Add a Salter (random placement)</div>",
		},
		"salterMaintenance": {
			title: "Salter Maintenance",
			flavor: "How did chewing gum get in there?",
			event: "<div>Remove a Salter (random selection)</div>",
		},
		"extraRoasty": {
			title: "The CEO is chilly",
			flavor: "Whatever you want sir...",
			event: "<div>Add a Roaster (random placement)</div>",
		},
		"roasterMaintenance": {
			title: "Roaster Maintenance",
			flavor: "Get in there and scrub out the Nut Smut",
			event: "<div>Remove a Roaster (random selection)</div>",
		},
		"p.up.a.down": {
			title: "Peanut beats Almond in general election",
			flavor: "Peanut wins in a tight race",
			event: "<div class=up>+$5 on any Peanut Shipped today</div>",
		},
		"p.down.a.up": {
			title: "Almond outshines Peanut at Fashion Week",
			flavor: "Peanut cannot pull off Chiffon",
			event: "<div class=up>+$5 on any Almond Shipped today</div>",
		},
		"s.up.u.down": {
			title: "Salted Nut dumps Unsalted Nut",
			flavor: "\"He was a narcissist\" says Salted Nut",
			event: "<div class=up>+$5 on any Salted Shipped today</div>",
		},
		"s.down.u.up": {
			title: "Unsalted Nut puts out banger diss track",
			flavor: "Throws shade on longtime rival Salted Nut",
			event: "<div class=up>+$5 on any Unsalted Shipped today</div>",
		},
		"w.up.r.down": {
			title: "Raw Nut wins big at Oscars",
			flavor: "Roasted Nut goes home empty handed agin",
			event: "<div class=up>+$5 on any Raw Shipped today</div>",
		},
		"w.down.r.up": {
			title: "Roasted Nut writes memoir",
			flavor: "Details the seedy underbelly of life with Raw Nut",
			event: "<div class=up>+$5 on any Roasted Shipped today</div>",
		},
		"w.down.r.up": {
			title: "Roasted Nut writes memoir",
			flavor: "Details the seedy underbelly of life with Raw Nut",
			event: "<div class=up>+$5 on any Roasted Shipped today</div>",
		},
		"weekend": {
			title: "Weekend",
			flavor: "Things settle down",
			event: `<div class=list>Raise prices for Orders</div>
				<div class=list>Remove Markers from used Powers (if playing with Powers)</div>
				<div class=list>Reset Roasters, Salters, and Squirrels to starting numbers (Randomize which to remove or where to add)</div>
				<div class=list>Run Factory: from lowest to highest number on Dispenser</div>`,
			specialOrdering: true,
		},
	}

	function getTotalNumEventCards()
	{
		var count = 0
		for (key in eventCardDescs) {
			var eventCardDesc = eventCardDescs[key]
			var contribution = eventCardDesc.number ? eventCardDesc.number : 1
			count = count + contribution
		}
		return count
	}

	function makeEventArrowDist() {
		var eventArrowDist = [
			0,
			0,
		]
		var numCards = getTotalNumEventCards()
		for (let i = 0; i < numCards; i++) {
			var index = i % 2
			eventArrowDist[index] = eventArrowDist[index] + 1
		}
		return eventArrowDist
	}
	var eventArrowDist = makeEventArrowDist()

	function getRandomEventArrow()
	{
		var index = gameUtils.getRandomInt(2)
		if (eventArrowDist[index] == 0) {
			index = (index + 1) % 2
		}
		eventArrowDist[index]--
		return index
	}

	function getEventCardDescAtIndex(index)
	{
		var count = 0
		for (key in eventCardDescs) {
			var eventCardDesc = eventCardDescs[key]
			var contribution = eventCardDesc.number ? eventCardDesc.number : 1
			count = count + contribution
			if (index < count) {
				return eventCardDesc
			}
		}
		return null
	}

	// Order Cards
	var numOrderCardsEachType = 4

	var allPosssibleOrder0QCardDescs = {}
	for (let i = 0; i < gameUtils.numNutTypes; i++) 
	{
		for (let j = 0; j < gameUtils.numSaltedTypes; j++)
		{
			for (let k = 0; k < gameUtils.numRoastedTypes; k++)
			{
				var desc = {
					nutType: i,
					saltedType: j,
					roastedType: k,
				}
				allPosssibleOrderQCardDescs.push(desc)
			}
		}
	}

	var allPosssibleOrder1QCardDescs = {}
	for (let i = 0; i < gameUtils.numNutTypes; i++) 
	{
		for (let j = 0; j < gameUtils.numSaltedTypes; j++)
		{
			var desc = {
				nutType: i,
				saltedType: j,
				roastedType: -1,
			}
			allPosssibleOrder1QCardDescs.push(desc)
		}
	}
	for (let i = 0; i < gameUtils.numNutTypes; i++) 
	{
		for (let j = 0; j < gameUtils.numRoastedTypes; j++)
		{
			var desc = {
				nutType: i,
				saltedType: -1,
				roastedType: j,
			}
			allPosssibleOrder1QCardDescs.push(desc)
		}
	}
	for (let i = 0; i < gameUtils.numRoastedTypes; i++) 
	{
		for (let j = 0; j < gameUtils.numSaltedTypes; j++)
		{
			var desc = {
				nutType: -1,
				saltedType: j,
				roastedType: i,				
			}
			allPosssibleOrder1QCardDescs.push(desc)
		}
	}


	var allPosssibleOrder2QCardDescs = {}
	for (let i = 0; i < gameUtils.numNutTypes; i++) 
	{
		var desc = {
			nutType: i,
			saltedType: -1,
			roastedType: -1,
		}
		allPosssibleOrder2QCardDescs.push(desc)
	}
	for (let i = 0; i < gameUtils.numSaltedTypes; i++) 
	{
		var desc = {
			nutType: -1,
			saltedType: i,
			roastedType: -1,
		}
		allPosssibleOrder2QCardDescs.push(desc)
	}
	for (let i = 0; i < gameUtils.numRoastedTypes; i++) 
	{
		var desc = {
			nutType: -1,
			saltedType: -1,
			roastedType: i,
		}
		allPosssibleOrder2QCardDescs.push(desc)
	}

	var numPossibleOrder0QCards = allPosssibleOrder0QCardDescs.length
	var numPossibleOrder1QCards = allPosssibleOrder1QCardDescs.length
	var numPossibleOrder2QCards = allPosssibleOrder2QCardDescs.length
	var numOrderCards = (numPossibleOrder0QCards + numPossibleOrder1QCards + numPossibleOrder2QCards) * numOrderCardsEachType
	
	var baseOrderNumber = 13010


	function makeFeatureCountByFeatureType(count) {
		var nutTypeFeatureCount = []
		nutTypeFeatureCount.push(numOrderCardsEachType/3 * count)
		nutTypeFeatureCount.push(numOrderCardsEachType/3 * count)
		nutTypeFeatureCount.push(numOrderCardsEachType/3 * count)

		var saltedFeatureCount = []
		saltedFeatureCount.push(numOrderCardsEachType/3 * count)
		saltedFeatureCount.push(numOrderCardsEachType/3 * count)
		saltedFeatureCount.push(numOrderCardsEachType/3 * count)

		var roastedFeatureCount = []
		roastedFeatureCount.push(numOrderCardsEachType/3 * count)
		roastedFeatureCount.push(numOrderCardsEachType/3 * count)
		roastedFeatureCount.push(numOrderCardsEachType/3 * count)

		var retVal = {
			nutType: nutTypeFeatureCount,
			salted: saltedFeatureCount,
			roasted: roastedFeatureCount,
		}
		return retVal

	}

	var featureCountByFeatureTypeByOrderCount = {
		1: makeFeatureCountByFeatureType(1),
		2: makeFeatureCountByFeatureType(2),
		3: makeFeatureCountByFeatureType(3),
	}

	function getRandomOrderFeatureValue(orderCount, featureType) {
		var featureCountByFeatureType = featureCountByFeatureTypeByOrderCount[orderCount]
		var featureValue = gameUtils.getRandomInt(3)
		while (true) {
			var remainingCountsByValue = featureCountByFeatureType[featureType]
			var remainingCount = remainingCountsByValue[featureValue]
		if (remainingCount > 0) {
				remainingCountsByValue[featureValue]--

				return featureValue
			} else {
				featureValue  = (featureValue + 1) % 3
			}
		}
	}

	function addNutDesc(node, desc) {
		var nutPropsNode = gameUtils.addDiv(node, "nutProps standardMargin", "nutProps")

		var content = `<img class="nut_image" alt="" src="${nutTypeImage}" title=""><img class="salted_image" alt="" src="${saltedImage}" title=""><img class="roasted_image" alt="" src="${roastedImage}" title="">`

		var nutType = desc.nutType
		var saltedType = desc.saltedType
		var roastedType = desc.roastedType

		var nutTypeImage = nutType == -1 ? gameUtils.wildImage: gameUtils.nutTypeImages[nutType]
		var saltedTypeImage = saltedType == -1 ? gameUtils.wildImage: gameUtils.saltedTypeImages[saltedType]
		var roastedTypeImage = roastedType == -1 ? gameUtils.wildImage: gameUtils.roastedTypeImages[roastedType]

		var prop 
		prop = gameUtils.addDiv(node, "nutProp nutType", "nutType", content)
		gameUtils.addImage(prop, "nutType", "nutType", nutTypeImage)
		prop = gameUtils.addDiv(node, "nutProp saltedType", "saltedType", content)
		gameUtils.addImage(prop, "saltedType", "saltedType", saltedTypeImage)
		prop = gameUtils.addDiv(node, "nutProp roastedType", "roastedType", content)
		gameUtils.addImage(prop, "roastedType", "roastedType", roastedTypeImage)
		return nutDescsNode
	}

	function makeNthOrderCard(parent, index)
	{
		var realIndex = Math.floor(index/numOrderCardsEachType)
		var orderNumber = baseOrderNumber + index

		var desc
		if (realIndex < numPossibleOrder0QCards)
		{
		 	desc = allPosssibleOrder0QCardDescs[realIndex]
		}
		else
		{
			realIndex -= numPossibleOrder0QCards
			if (realIndex < numPossibleOrder1QCards)
			{
				desc = allPosssibleOrder1QCardDescs[realIndex]
			} 
			else
			{
				realIndex -= numPossibleOrder1QCards
				desc = allPosssibleOrder2QCardDescs[realIndex]
	
			}
		}
		var node = makeCardFront(parent, `order`, "order.".concat(index.toString()))
		gameUtils.addDiv(node, "title", "title", "Order #" + orderNumber.toString())
		addNutDesc(node, desc)
	}

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

	function makeCardFront(parent, classes, id) {
		var classes = "card front " + classes
		var node = gameUtils.addDiv(parent, classes, id)
		domStyle.set(node, {
			"width": `${gameUtils.cardWidth}px`,
			"height": `${gameUtils.cardHeight}px`,
		})
		return node
	}

    // This returned object becomes the defined value of this module
    return {
		// Agenda Cards
		numAgendaCards: Object.keys(agendaCardDescs).length,
		makeAgendaCard: function (parent, index) {
			var cardDesc = agendaCardDescs[index]

			var node = makeCardFront(parent, "agenda", "agenda.".concat(index.toString()))
			gameUtils.addDiv(node, "title", "title", cardDesc.title)
			gameUtils.addDiv(node, "flavor", "flavor", cardDesc.flavor)
			var goalClasses = "goal"
			if (cardDesc.extraClasses) {
				goalClasses = goalClasses + " " + cardDesc.extraClasses
			}
			gameUtils.addDiv(node, goalClasses, "goal", cardDesc.goal)

			return node
		},

		// Power Cards
		numPowerCards: Object.keys(powerCardDescs).length,
		makePowerCard: function (parent, index) {
			var cardDesc = powerCardDescs[index]

			var node = makeCardFront(parent, "power", "power.".concat(index.toString()))
			gameUtils.addDiv(node, "title", "title", cardDesc.title)
			gameUtils.addDiv(node, "power", "power", cardDesc.power)
			gameUtils.addDiv(node, "timing", "timing", cardDesc.timing)

			return node
		},

		// Event Cards
		numEventCards: getTotalNumEventCards(),
		makeEventCard: function (parent, index) {
			var cardDesc = getEventCardDescAtIndex(index)

			var node = makeCardFront(parent, "event", "event.".concat(index.toString()))
			gameUtils.addDiv(node, "title", "title", cardDesc.title)
			gameUtils.addDiv(node, "flavor", "flavor", cardDesc.flavor)
			gameUtils.addDiv(node, "event", "event", cardDesc.event)
			var resolutionText
			if (!cardDesc.specialOrdering) {
				var resolutionIndex = getRandomEventArrow()
				resolutionText = resolutionIndex == 0? "&#x2190": "&#x2192"
				gameUtils.addDiv(node, "resolutionOrder", "resolutionOrder", "Run Factory: " + resolutionText)
			}

			return node
		},

		// Action cards
		numActionCards: actionCardDescs.length,
		makeActionCard: function (parent, index) {
			var actionCardDesc = actionCardDescs[index]

			var node = makeCardFront(parent, "action", "action.".concat(index.toString()))
			gameUtils.addDiv(node, "title", "title", actionCardDesc.title)
			gameUtils.addDiv(node, "action", "action", actionCardDesc.action)

			return node
		},

		// Order Cards
		numOrderCards: numOrderCards,

		makeOrderCard: function(parent, index) {
			return makeNthOrderCard(parent, index)
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