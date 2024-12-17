define([
	'javascript/rowTypes',
	'dojo/domReady!'
], function(rowTypes){

	var orderedRowTypes = [
		rowTypes.Number,
		rowTypes.Dispenser,
		rowTypes.Conveyor,
		rowTypes.Conveyor,
		rowTypes.Salter,
		rowTypes.Conveyor,
		rowTypes.Conveyor,
		rowTypes.Squirrel,
		rowTypes.Conveyor,
		rowTypes.Conveyor,
		rowTypes.Order,
	]

	var factoryColumnCount = 16

    return {
		orderedRowTypes: orderedRowTypes,
		factoryColumnCount: factoryColumnCount,
    };
});