define([
	'dojo/domReady!'
], function() {
	var Number = 1
	var Dispenser = 2
	var Conveyor = 3
	var Squirrel = 4
	var Roaster = 5
	var Salter = 6
	var Order = 7

    return {
		// Can be used to make a board in sections or a complete board.
		Number: Number,
		Dispenser : Dispenser,
		Conveyor: Conveyor,
        Squirrel: Squirrel,
		Roaster: Roaster,
		Salter: Salter,
		Order: Order,
    }
})