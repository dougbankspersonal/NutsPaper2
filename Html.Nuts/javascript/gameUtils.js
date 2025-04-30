define([
  "dojo/dom",
  "dojo/query",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "sharedJavascript/systemConfigs",
  "javascript/measurements",
  "dojo/domReady!",
], function (
  dom,
  query,
  debugLog,
  genericUtils,
  htmlUtils,
  systemConfigs,
  measurements
) {
  var highlightAlpha = 0.4;
  var redHighlightColor = "rgba(255, 128, 128, 0.6)";
  var blueHighlightColor = "rgba(128, 128, 255, 0.6)";
  var yellowHighlightColor = "rgba(255, 255, 128, " + highlightAlpha + ")";
  var greenHighlightColor = "rgba(128, 255, 128, " + highlightAlpha + ")";

  var yellowBeltHighlightColor = "rgba(255, 255, 128, 0.6)";

  var minPlayers = 2;
  var maxPlayers = 5;

  function getSlotId(rowIndex, columnIndex) {
    var idPieces = ["slot", rowIndex.toString(), columnIndex.toString()];
    return idPieces.join("_");
  }

  function getRowId(rowIndex) {
    var idPieces = ["row", rowIndex.toString()];
    return idPieces.join("_");
  }

  function getElementId(columnIndex) {
    var elementId = "element_".concat(columnIndex.toString());
    return elementId;
  }

  function getElementFromRow(rowNode, columnIndex) {
    var elementId = getElementId(columnIndex);
    var elementNodes = query(`#${elementId}`, rowNode);
    return elementNodes[0];
  }

  function getSlot(rowNode, columnIndex) {
    var elementId = getSlotId(columnIndex);
    var elementNodes = query(`#${elementId}`, rowNode);
    return elementNodes[0];
  }

  function addRow(parent, opt_classArray, rowIndex) {
    var sc = systemConfigs.getSystemConfigs();
    console.assert(parent, "parent is null");
    var classArray = genericUtils.growOptStringArray(opt_classArray, "row");
    var rowId = getRowId(rowIndex);
    var rowNode = htmlUtils.addDiv(parent, classArray, rowId);
    return rowNode;
  }

  function getSlot(rowIndex, columnIndex) {
    var slotId = getSlotId(rowIndex, columnIndex);
    return dom.byId(slotId);
  }

  function addDemoBoardSystemConfigs(opt_scInput) {
    debugLog.debugLog("Layout", "Doug: addDemoBoardSystemConfigs 001");
    var sc = opt_scInput ? opt_scInput : {};
    sc.cardHeight = measurements.smallCardWidth;
    sc.cardWidth = measurements.smallCardWidth;
    sc.cardBackFontSize = measurements.smallCardBackFontSize;
    sc.pageless = true;
    sc.demoBoard = true;
    sc.explicitPageWidth = measurements.totalBoardWidth;
    return sc;
  }

  function addGameBoardSystemConfigs(opt_scInput) {
    var sc = opt_scInput ? opt_scInput : {};
    sc.gridGap = 0;
    sc.isCards = false;
    sc.maxRowsPerPage = 4;
    sc.maxColumnsPerPage = 4;
    return sc;
  }

  // This returned object becomes the defined value of this module
  return {
    addRow: addRow,
    getSlot: getSlot,
    getSlotId: getSlotId,
    getRowId: getRowId,
    getElementId: getElementId,
    getElementFromRow: getElementFromRow,
    addDemoBoardSystemConfigs: addDemoBoardSystemConfigs,
    addGameBoardSystemConfigs: addGameBoardSystemConfigs,

    redHighlightColor: redHighlightColor,
    blueHighlightColor: blueHighlightColor,
    yellowHighlightColor: yellowHighlightColor,
    greenHighlightColor: greenHighlightColor,
    yellowBeltHighlightColor: yellowBeltHighlightColor,
    minPlayers: minPlayers,
    maxPlayers: maxPlayers,
  };
});
