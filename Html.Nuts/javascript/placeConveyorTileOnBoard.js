define([
  "dojo/dom",
  "dojo/dom-style",
  "dojo/dom-class",
  "sharedJavascript/debugLog",
  "javascript/conveyorTiles",
  "javascript/conveyorTileTypes",
  "javascript/gameUtils",
  "javascript/highlights",
  "javascript/measurements",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  domClass,
  debugLog,
  conveyorTiles,
  conveyorTileTypes,
  gameUtils,
  highlights,
  measurements
) {
  var addedConveyorTileIndex = 0;

  function getNextConveyorTileId() {
    return `conveyorTile_${addedConveyorTileIndex++}`;
  }

  function placeConveyorTile(
    conveyorTileType,
    rowIndex,
    columnIndex,
    opt_classArray
  ) {
    debugLog.debugLog(
      "ConveyorTiles",
      "place: conveyorTileType = " + conveyorTileType
    );
    debugLog.debugLog("ConveyorTiles", "place: rowIndex = " + rowIndex);
    debugLog.debugLog("ConveyorTiles", "place: columnIndex = " + columnIndex);
    debugLog.debugLog(
      "ConveyorTiles",
      "place: opt_classArray = " + JSON.stringify(opt_classArray)
    );

    console.assert(
      conveyorTileTypes.isConveyorTileType(conveyorTileType),
      "Invalid tile type: " + conveyorTileType
    );

    var classArray = opt_classArray ? opt_classArray : [];

    var slotId = gameUtils.getSlotId(rowIndex, columnIndex);
    var slot = dom.byId(slotId);
    var conveyorTileId = getNextConveyorTileId();

    var conveyorTile = conveyorTiles.addConveyorTile(
      slot,
      conveyorTileId,
      conveyorTileType,
      classArray
    );

    domStyle.set(conveyorTile, {
      "margin-left": `${measurements.conveyorTileOnBoardLeftMargin}px`,
      "margin-top": `${measurements.conveyorTileOnBoardTopMargin}px`,
      "z-index": `${measurements.conveyorTileZIndex}`,
    });

    var isGhost = false;
    if (domClass.contains(conveyorTile, "ghost")) {
      isGhost = true;
    }

    highlights.storeConveyorTileData(
      rowIndex,
      columnIndex,
      conveyorTileId,
      conveyorTileType,
      isGhost
    );
    return conveyorTile;
  }

  // This returned object becomes the defined value of this module
  return {
    placeConveyorTile: placeConveyorTile,
  };
});
