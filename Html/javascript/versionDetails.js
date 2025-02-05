define([
	'javascript/rowTypes',
	'dojo/domReady!'
], function(rowTypes) {

	var version_004_03 = "004_03"
	var version_onePager = "onePager"
	var version_005_01 = "005_01"
	var version_006 = "006"

	var version = version_004_03

	function setVersion(_version)
	{
		version = _version
	}

	var orderedRowTypesByVersion = {}
	orderedRowTypesByVersion[version_004_03] = [
		rowTypes.RowTypes.Number,
		rowTypes.RowTypes.Dispenser,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Salter,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Squirrel,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Boxes,
	]

	orderedRowTypesByVersion[version_005_01] = [
		rowTypes.RowTypes.Number,
		rowTypes.RowTypes.Dispenser,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Salter,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Squirrel,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Roaster,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Boxes,
	]

	orderedRowTypesByVersion[version_onePager] = [
		rowTypes.RowTypes.Number,
		rowTypes.RowTypes.Start,
		rowTypes.RowTypes.Path,
		rowTypes.RowTypes.Path,
		rowTypes.RowTypes.Heart,
		rowTypes.RowTypes.Path,
		rowTypes.RowTypes.Skull,
		rowTypes.RowTypes.Path,
		rowTypes.RowTypes.Heart,
		rowTypes.RowTypes.Path,
		rowTypes.RowTypes.Path,
		rowTypes.RowTypes.End,
	]

	orderedRowTypesByVersion[version_006] = [
		rowTypes.RowTypes.Dispenser,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Conveyor,
		rowTypes.RowTypes.Boxes,
	]

	function getRowTypes()
	{
		return orderedRowTypesByVersion[version]
	}

	function getFactoryColumnCount() {
		return 8
	}

    return {
		version_004_03: version_004_03,
		version_005_01: version_005_01,
		version_onePager: version_onePager,
		version_006: version_006,

		setVersion: setVersion,
		getRowTypes: getRowTypes,
		getFactoryColumnCount: getFactoryColumnCount,
    };
});