define(["javascript/rowTypes", "dojo/domReady!"], function (rowTypes) {
  var version_onePager = "onePager";
  var version_005 = "005";
  var version_006 = "006";

  function setVersion(_version) {
    version = _version;
  }

  var orderedRowTypesByVersion = {};

  orderedRowTypesByVersion[version_005] = [
    rowTypes.Number,
    rowTypes.Dispenser,
    rowTypes.Conveyor,
    rowTypes.Conveyor,
    rowTypes.Salter,
    rowTypes.Conveyor,
    rowTypes.Squirrel,
    rowTypes.Conveyor,
    rowTypes.Roaster,
    rowTypes.Conveyor,
    rowTypes.Conveyor,
    rowTypes.BoxHolders,
  ];

  orderedRowTypesByVersion[version_onePager] = [
    rowTypes.Number,
    rowTypes.Start,
    rowTypes.Path,
    rowTypes.Path,
    rowTypes.Heart,
    rowTypes.Path,
    rowTypes.Skull,
    rowTypes.Path,
    rowTypes.Heart,
    rowTypes.Path,
    rowTypes.Path,
    rowTypes.End,
  ];

  orderedRowTypesByVersion[version_006] = [
    rowTypes.Dispenser,
    rowTypes.Conveyor,
    rowTypes.Conveyor,
    rowTypes.Conveyor,
    rowTypes.Conveyor,
    rowTypes.Conveyor,
    rowTypes.Conveyor,
    rowTypes.Boxes,
  ];

  function getOrderedRowTypes() {
    return orderedRowTypesByVersion[version];
  }

  function getTotalNumColumns() {
    return 8;
  }

  return {
    version_005: version_005,
    version_onePager: version_onePager,
    version_006: version_006,

    setVersion: setVersion,
    getOrderedRowTypes: getOrderedRowTypes,
    getTotalNumColumns: getTotalNumColumns,
  };
});
