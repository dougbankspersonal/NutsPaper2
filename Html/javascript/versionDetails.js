define([
	'javascript/gameUtils',
	'javascript/rowTypes',
	'dojo/domReady!'
], function(gameUtils, rowTypes){

	var rowTypesForV003 = [
		rowTypes.Number,
		rowTypes.Dispenser,
		rowTypes.Conveyor,
		rowTypes.Squirrel,
		rowTypes.Conveyor,
		rowTypes.Roaster,
		rowTypes.Conveyor,
		rowTypes.Salter,
		rowTypes.Conveyor,
		rowTypes.Order,
	]

	var rowTypesForV004 = [
		rowTypes.Number,
		rowTypes.Dispenser,
		rowTypes.Conveyor,
		rowTypes.Conveyor,
		rowTypes.Conveyor,
		rowTypes.Squirrel,
		rowTypes.Conveyor,
		rowTypes.Conveyor,
		rowTypes.Conveyor,
		rowTypes.Order,
	]

	var rowTypesForV004_01 = [
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

	var rowTypesByVersion = {}
	rowTypesByVersion[gameUtils.version003] = rowTypesForV003
	rowTypesByVersion[gameUtils.version004] = rowTypesForV004
	rowTypesByVersion[gameUtils.version004_01] = rowTypesForV004_01

	var factoryColumnCountByVersion = {}
	factoryColumnCountByVersion[gameUtils.version003] = 10
	factoryColumnCountByVersion[gameUtils.version004] = 12
	factoryColumnCountByVersion[gameUtils.version004_01] = 16

    return {
		rowTypesByVersion: rowTypesByVersion,
		factoryColumnCountByVersion: factoryColumnCountByVersion,
    };
});