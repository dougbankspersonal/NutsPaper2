define([
  "dojo/dom",
  "dojo/query",
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "javascript/boxHolders",
  "javascript/conveyorTileTypes",
  "javascript/gameUtils",
  "javascript/iconTypes",
  "javascript/nutTypes",
  "javascript/rowTypes",
  "javascript/versionDetails",
  "dojo/domReady!",
], function (
  dom,
  query,
  domStyle,
  debugLog,
  boxHolders,
  conveyorTileTypes,
  gameUtils,
  iconTypes,
  nutTypes,
  rowTypes,
  versionDetails
) {
  var boxHolderRowIndex;

  // A tile hits two slots.
  // Say first slot is row i, column j.
  // Then the tile is stored in conveyorTileDataByRowThenColumn[i][j]
  var conveyorTileDataByRowThenColumn = {};
  var topBoxNutTypeByColumn = {};

  function storeTopBoxNutType(columnIndex, numQuarterRightTurns) {
    // Woof.
    // boxHolderCardConfig.orderOfNutIconTypes gives nut types in clockwise order:
    // a, b, c, d
    // means
    //    a
    // d     b
    //    c
    // numQuarterRightTurns turns this wheel n times clockwise.
    // So if numQuarterRightTurns == 1, the above wheel becomes:
    //    d
    // c     a
    //    b
    // So if we are mapping numQuarterRughtTurns to the nut type on top of the wheel,
    // it goes backwards: numQuarterRightTurns = 1 means stepping back 1 step in
    // orderOfNutIconTypes.
    var nutIconTypeIndex = 4 - numQuarterRightTurns;

    // Make sure this is in the right range.
    while (nutIconTypeIndex < 0) {
      nutIconTypeIndex += 4;
    }
    nutIconTypeIndex = nutIconTypeIndex % 4;

    debugLog.debugLog(
      "Highlight",
      "Doug: storeTopBoxNutType columnIndex = " + columnIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: storeTopBoxNutType nutIconTypeIndex = " + nutIconTypeIndex
    );
    var boxHolderCardConfig = boxHolders.boxHolderCardConfigs[columnIndex];
    debugLog.debugLog(
      "Highlight",
      "Doug: storeTopBoxNutType boxHolderCardConfig = " +
        JSON.stringify(boxHolderCardConfig)
    );

    var topNutIconType =
      boxHolderCardConfig.orderOfNutIconTypes[nutIconTypeIndex];
    debugLog.debugLog(
      "Highlight",
      "Doug: storeTopBoxNutType topNutIconType = " +
        JSON.stringify(topNutIconType)
    );
    var topNutType = iconTypes.getNutTypeFromIconType(topNutIconType);
    debugLog.debugLog(
      "Highlight",
      "Doug: storeTopBoxNutType topNutType = " + JSON.stringify(topNutType)
    );
    topBoxNutTypeByColumn[columnIndex] = topNutType;
    debugLog.debugLog(
      "Highlight",
      "Doug: storeTopBoxNutType topBoxNutTypeByColumn = " +
        JSON.stringify(topBoxNutTypeByColumn)
    );
  }

  function getTopBoxNutType(columnIndex) {
    debugLog.debugLog(
      "Highlight",
      "Doug: getTopBoxNutType columnIndex = " + columnIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: getTopBoxNutType topBoxNutTypeByColumn = " +
        JSON.stringify(topBoxNutTypeByColumn)
    );
    console.assert(
      topBoxNutTypeByColumn[columnIndex],
      "topBoxNutTypeByColumn[columnIndex] is null"
    );
    return topBoxNutTypeByColumn[columnIndex];
  }

  /* Data is of the form:
  {
      conveyorTileId: conveyorTileId,
      conveyorTileType: conveyorTileType,
      conveyorTileType: conveyorTileType,
      isGhost: isGhost,
  }
  */
  function storeConveyorTileData(
    rowIndex,
    columnIndex,
    conveyorTileId,
    conveyorTileType,
    isGhost
  ) {
    debugLog.debugLog(
      "Highlight",
      "Doug: storeConveyorTileData rowIndex = " + rowIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: storeConveyorTileData columnIndex = " + columnIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: storeConveyorTileData conveyorTileId = " + conveyorTileId
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: storeConveyorTileData conveyorTileType = " + conveyorTileType
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: storeConveyorTileData isGhost = " + isGhost
    );

    var rowIndexString = "X_" + rowIndex.toString();
    var columnIndexString = "X_" + columnIndex.toString();

    if (!conveyorTileDataByRowThenColumn[rowIndexString]) {
      conveyorTileDataByRowThenColumn[rowIndexString] = {};
    }
    conveyorTileDataByRowThenColumn[rowIndexString][columnIndexString] = {
      conveyorTileId: conveyorTileId,
      conveyorTileType: conveyorTileType,
      conveyorTileType: conveyorTileType,
      isGhost: isGhost,
    };
  }

  /* Data is of the form:
  {
      conveyorTileId: conveyorTileId,
      conveyorTileType: conveyorTileType,
      conveyorTileType: conveyorTileType,
      isGhost: isGhost,
  }

  Get the data for the tile who's left half covers the given cell.
  */
  function getStoredConveyorData(rowIndex, columnIndex) {
    var rowIndexString = "X_" + rowIndex.toString();
    var columnIndexString = "X_" + columnIndex.toString();
    if (!conveyorTileDataByRowThenColumn[rowIndexString]) {
      return null;
    }
    return conveyorTileDataByRowThenColumn[rowIndexString][columnIndexString];
  }

  // Get the conveyor tile plus other data.
  // Data is of the form:
  // {
  //   tile: tile,
  //   conveyorTileId: conveyorTileId,
  //   conveyorTileType: conveyorTileType,
  //   conveyorTileType: conveyorTileType,
  //   isGhost: isGhost,
  // }
  function getStoredConveyorTileAndData(rowIndex, columnIndex) {
    var conveyorData = getStoredConveyorData(rowIndex, columnIndex);
    if (!conveyorData) {
      return null;
    }

    var conveyorTileId = conveyorData.conveyorTileId;
    var conveyorTiles = query(`#${conveyorTileId}`);
    var tile = conveyorTiles[0];
    var augmentation = {
      tile: tile,
    };

    var mergedTable = { ...augmentation, ...conveyorData };
    return mergedTable;
  }

  // At most one non-ghost tile is in this slot.
  // Find and return it, along with whether the left lobe is on this cell (true)
  // or on the cell to the left (on column prior) (false).

  function getConveyorTileDataInSlot(rowIndex, columnIndex) {
    // Get left and right.
    var leftConveyorTileAndData = getStoredConveyorTileAndData(
      rowIndex,
      columnIndex
    );
    var rightConveyorTileAndData = getStoredConveyorTileAndData(
      rowIndex,
      columnIndex - 1
    );

    // If no left, only right is possible.
    if (!leftConveyorTileAndData || leftConveyorTileAndData.isGhost) {
      if (!rightConveyorTileAndData || rightConveyorTileAndData.isGhost) {
        return null;
      }
      return [rightConveyorTileAndData, false];
    }
    // Left is non-null, non-ghost.
    // Sanity check: right is null or ghost.
    console.assert(
      !rightConveyorTileAndData || rightConveyorTileAndData.isGhost
    );
    return [leftConveyorTileAndData, true];
  }

  function highlightNode(node, color, opt_options) {
    console.assert(node, "Node should not be null");
    var options = opt_options ? opt_options : {};
    var extra = options.extra ? options.extra : false;
    var noShadow = options.noShadow ? options.noShadow : false;

    var blurRadius = extra ? "20px" : "10px";
    var spreadRadius = extra ? "10px" : "5px";
    if (noShadow) {
      domStyle.set(node, {
        "background-color": color,
      });
    } else {
      domStyle.set(node, {
        "box-shadow": `0 0 ${blurRadius} ${spreadRadius} ${color}`,
      });
    }
  }

  function highlightQueryResult(node, queryArg, color, opt_options) {
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightQueryResult node.id = " + node.id
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightQueryResult queryArg = " + queryArg
    );
    var nodes = query(queryArg, node);
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightQueryResult nodes.length = " + nodes.length
    );
    for (var i = 0; i < nodes.length; i++) {
      var element = nodes[i];
      highlightNode(element, color, opt_options);
    }
    return nodes.length;
  }

  function getIndexOfFirstRowOfType(rowType) {
    var orderedRowTypes = versionDetails.getOrderedRowTypes();
    debugLog.debugLog(
      "Highlight",
      "Doug: orderedRowTypes = " + JSON.stringify(orderedRowTypes)
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: getIndexOfFirstRowOfType rowType = " + rowType
    );
    for (var i = 0; i < orderedRowTypes.length; i++) {
      if (orderedRowTypes[i] == rowType) {
        return i;
      }
    }
    // Should never happen.
    console.assert(false, "Doug: getIndexOfFirstRowOfType rowType not found");
    return null;
  }

  // Find the tile whose left half is in this slot.
  // Highlight it.
  // Note this does not highlight the PATH in the tile: we are just putting a halo around
  // the tile.
  function highlightConveyorTile(rowIndex, columnIndex, color) {
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightConveyorTile: rowIndex = " + rowIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightConveyorTile: columnIndex = " + columnIndex
    );
    var conveyorTileAndData = getStoredConveyorTileAndData(
      rowIndex,
      columnIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: conveyorTileAndData: conveyorTileAndData = " +
        JSON.stringify(conveyorTileAndData)
    );

    // No tile, we're done.
    if (!conveyorTileAndData) {
      return;
    }

    // Get the tile.
    var conveyorTile = conveyorTileAndData.tile;

    console.assert(conveyorTile);

    highlightNode(conveyorTile, color, {
      extra: true,
    });
  }

  // Find the tile whose left half is in this slot.
  // Highlight it.
  // Note this does not highlight the PATH in the tile: we are just putting a halo around
  // the tile.
  function highlightConveyorTile(rowIndex, columnIndex, color) {
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightConveyorTile: rowIndex = " + rowIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightConveyorTile: columnIndex = " + columnIndex
    );
    var conveyorTileAndData = getStoredConveyorTileAndData(
      rowIndex,
      columnIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightConveyorTile: conveyorTileAndData = " +
        JSON.stringify(conveyorTileAndData)
    );

    // No tile, we're done.
    if (!conveyorTileAndData) {
      return;
    }

    // Get the tile.
    var conveyorTile = conveyorTileAndData.tile;

    console.assert(conveyorTile);

    highlightNode(conveyorTile, color, {
      extra: true,
    });
  }

  function highlightBoxHolder(columnIndex, highlightColor) {
    var orderedRowTypes = versionDetails.getOrderedRowTypes();
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightBoxHolder orderedRowTypes = " +
        JSON.stringify(orderedRowTypes)
    );

    boxHolderRowIndex = getIndexOfFirstRowOfType(rowTypes.BoxHolders);
    console.assert(
      boxHolderRowIndex !== null,
      "Doug: highlightBoxHolder boxHolderRowIndex is null"
    );

    var boxHolderRowId = gameUtils.getRowId(boxHolderRowIndex);
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightBoxHolder boxHolderRowId = " + boxHolderRowId
    );
    var boxHolderRowNode = dom.byId(boxHolderRowId);

    debugLog.debugLog(
      "Highlight",
      "Doug: highlightBoxHolder boxHolderRowNode = " + boxHolderRowNode
    );
    console.assert(boxHolderRowNode, "Row node should not be null");
    var queryTerm = "#boxHolder_" + columnIndex;
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightBoxHolder queryTerm = " + queryTerm
    );
    highlightQueryResult(boxHolderRowNode, queryTerm, highlightColor);
  }

  function addStepAndHandleWhatsNext(
    rowIndex,
    columnIndex,
    dispenserNutType,
    step
  ) {
    // Do the recursive step.
    var paths = recursiveFindConnectingPaths(
      rowIndex + 1,
      columnIndex,
      dispenserNutType
    );
    // For any paths we got back, update with this step.
    // It goes at the beginning of the array.
    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      path.steps.unshift(step);
    }

    debugLog.debugLog(
      "Highlight",
      "Doug: addStepAndHandleWhatsNext paths = " + JSON.stringify(paths)
    );

    return paths;
  }

  function doBaseCase(rowIndex, columnIndex, dispenserNutType) {
    debugLog.debugLog("Highlight", "Doug: doBaseCase rowIndex = " + rowIndex);
    debugLog.debugLog(
      "Highlight",
      "Doug: doBaseCase columnIndex = " + columnIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: doBaseCase dispenserNutType = " + dispenserNutType
    );

    // See if topmost box matches nut type.
    var topBoxType = getTopBoxNutType(columnIndex);
    debugLog.debugLog(
      "Highlight",
      "Doug: doBaseCase topBoxType = " + JSON.stringify(topBoxType)
    );

    if (topBoxType != dispenserNutType) {
      // This particular path is invalid.
      return [];
    }

    // It is valid: return a path of all the steps so far.
    // First a step for tihs final slot.
    var slot = gameUtils.getSlot(rowIndex, columnIndex);
    var step = {
      slot: slot,
      rowIndex: rowIndex,
      columnIndex: columnIndex,
    };
    // Return this path.
    var path = {
      steps: [step],
    };
    return [path];
  }

  function doSlotCase(rowIndex, columnIndex, dispenserNutType) {
    debugLog.debugLog("Highlight", "Doug: doSlotCase rowIndex = " + rowIndex);
    debugLog.debugLog(
      "Highlight",
      "Doug: doSlotCase columnIndex = " + columnIndex
    );
    // There is no tile here, we are passing straight through.
    // Just remember the slot.
    var slot = gameUtils.getSlot(rowIndex, columnIndex);
    console.assert(slot, "Slot should not be null");
    var step = {
      slot: slot,
      rowIndex: rowIndex,
      columnIndex: columnIndex,
    };
    return addStepAndHandleWhatsNext(
      rowIndex,
      columnIndex,
      dispenserNutType,
      step
    );
  }

  function doRightLobeCase(
    conveyorTileAndData,
    rowIndex,
    columnIndex,
    dispenserNutType
  ) {
    var allPaths = [];
    // We are coming in to right side.
    if (
      conveyorTileAndData.conveyorTileType == conveyorTileTypes.SplitterRight ||
      conveyorTileAndData.conveyorTileType == conveyorTileTypes.JoinerRight
    ) {
      console.assert(conveyorTileAndData.tile, "tile should not be null");
      var step = {
        conveyorTile: conveyorTileAndData.tile,
        conveyorTileBeltQuery: ".belt.rightStraight",
        rowIndex: rowIndex,
        columnIndex: columnIndex,
      };
      // Do the recursive step.
      var paths = addStepAndHandleWhatsNext(
        rowIndex,
        columnIndex,
        dispenserNutType,
        step
      );
      debugLog.debugLog(
        "Highlight",
        "Doug: doRightLobeCase c1 paths = " + JSON.stringify(paths)
      );

      allPaths = allPaths.concat(paths);
      debugLog.debugLog(
        "Highlight",
        "Doug: doRightLobeCase c1 allPaths = " + JSON.stringify(allPaths)
      );
    }
    if (
      conveyorTileAndData.conveyorTileType == conveyorTileTypes.Cross ||
      conveyorTileAndData.conveyorTileType == conveyorTileTypes.SplitterRight ||
      conveyorTileAndData.conveyorTileType == conveyorTileTypes.JoinerLeft
    ) {
      var step = {
        conveyorTile: conveyorTileAndData.tile,
        conveyorTileBeltQuery: ".belt.right",
        rowIndex: rowIndex,
        columnIndex: columnIndex,
      };
      // Do the recursive step.
      var paths = addStepAndHandleWhatsNext(
        rowIndex,
        columnIndex - 1,
        dispenserNutType,
        step
      );
      debugLog.debugLog(
        "Highlight",
        "Doug: doRightLobeCase c2 paths = " + JSON.stringify(paths)
      );

      allPaths = allPaths.concat(paths);
      debugLog.debugLog(
        "Highlight",
        "Doug: doRightLobeCase c2 allPaths = " + JSON.stringify(allPaths)
      );
    }
    debugLog.debugLog(
      "Highlight",
      "Doug: doRightLobeCase returning allPaths = " + JSON.stringify(allPaths)
    );

    return allPaths;
  }

  function doLeftLobeCase(
    conveyorTileAndData,
    rowIndex,
    columnIndex,
    dispenserNutType
  ) {
    debugLog.debugLog(
      "Highlight",
      "Doug: doLeftLobeCase for columnIndex = " + columnIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: doLeftLobeCase for rowIndex = " + rowIndex
    );

    var allPaths = [];
    // We are coming in to left side.
    if (
      conveyorTileAndData.conveyorTileType == conveyorTileTypes.SplitterLeft ||
      conveyorTileAndData.conveyorTileType == conveyorTileTypes.JoinerLeft
    ) {
      var step = {
        conveyorTile: conveyorTileAndData.tile,
        conveyorTileBeltQuery: ".belt.leftStraight",
        rowIndex: rowIndex,
        columnIndex: columnIndex,
      };
      // Do the recursive step.
      var paths = addStepAndHandleWhatsNext(
        rowIndex,
        columnIndex,
        dispenserNutType,
        step
      );
      allPaths = allPaths.concat(paths);
    }
    if (
      conveyorTileAndData.conveyorTileType == conveyorTileTypes.Cross ||
      conveyorTileAndData.conveyorTileType == conveyorTileTypes.SpliterLeft ||
      conveyorTileAndData.conveyorTileType == conveyorTileTypes.JoinerRight
    ) {
      var step = {
        conveyorTile: conveyorTileAndData.tile,
        conveyorTileBeltQuery: ".belt.left",
        rowIndex: rowIndex,
        columnIndex: columnIndex,
      };
      // Do the recursive step.
      var paths = addStepAndHandleWhatsNext(
        rowIndex,
        columnIndex + 1,
        dispenserNutType,
        step
      );
      allPaths = allPaths.concat(paths);
    }
    debugLog.debugLog(
      "Highlight",
      "Doug: doRightLobeCase returning allPaths = " + JSON.stringify(allPaths)
    );
    return allPaths;
  }

  // Recursive path building.
  function recursiveFindConnectingPaths(
    rowIndex,
    columnIndex,
    dispenserNutType
  ) {
    debugLog.debugLog(
      "Highlight",
      "Doug: recursiveFindConnectingPaths rowIndex = " + rowIndex
    );

    debugLog.debugLog(
      "Highlight",
      "Doug: recursiveFindConnectingPaths columnIndex = " + columnIndex
    );

    debugLog.debugLog(
      "Highlight",
      "Doug: recursiveFindConnectingPaths boxHolderRowIndex = " +
        boxHolderRowIndex
    );
    // Sanity.
    var orderedRowTypes = versionDetails.getOrderedRowTypes();
    console.assert(rowIndex < orderedRowTypes.length, "rowIndex out of bounds");
    if (rowIndex >= orderedRowTypes.length) {
      return [];
    }

    if (rowIndex == boxHolderRowIndex) {
      var retVal = doBaseCase(rowIndex, columnIndex, dispenserNutType);
      debugLog.debugLog(
        "Highlight",
        "Doug: recursiveFindConnectingPaths baseCase. RetVal = " +
          JSON.stringify(retVal)
      );
      return retVal;
    }

    // recursive case.
    // We are walking through either a belt going straight down (possibly through some element, e.g. the squirrel)
    // or a tile, which may reroute us.
    // The tile may even split us.
    // So worry about all that.
    // Find the tile that crosses this spot.
    var conveyorTileDataInSlot = getConveyorTileDataInSlot(
      rowIndex,
      columnIndex
    );
    if (!conveyorTileDataInSlot) {
      return doSlotCase(rowIndex, columnIndex, dispenserNutType);
    } else {
      // These is a conveyor tile here.
      // What kind is it, and which side are we coming in on?
      var conveyorTileAndData = conveyorTileDataInSlot[0];
      var leftLobeInThisSlot = conveyorTileDataInSlot[1];

      if (leftLobeInThisSlot) {
        return doLeftLobeCase(
          conveyorTileAndData,
          rowIndex,
          columnIndex,
          dispenserNutType
        );
      } else {
        return doRightLobeCase(
          conveyorTileAndData,
          rowIndex,
          columnIndex,
          dispenserNutType
        );
      }
    }
  }

  function findConnectingPaths() {
    debugLog.debugLog("Highlight", "Doug: findConnectingPaths 001");
    var totalNumColumns = versionDetails.getTotalNumColumns();

    var allPaths = [];
    var startingRowIndex = 1;
    for (var columnIndex = 0; columnIndex < totalNumColumns; columnIndex++) {
      debugLog.debugLog("Highlight", "Doug: findConnectingPaths 001");
      // 0th row numbers: skip.
      // 1st is nut types: get dispenser nut type.
      var dispenserNutType =
        nutTypes.orderedNutTypes[columnIndex % nutTypes.orderedNutTypes.length];
      // In light of splitter, may be the start of more than one path.
      // Find the slot for this space, start a record.
      var slot = gameUtils.getSlot(startingRowIndex, columnIndex);
      var step = {
        slot: slot,
        rowIndex: startingRowIndex,
        columnIndex: columnIndex,
      };
      var paths = recursiveFindConnectingPaths(
        startingRowIndex + 1,
        columnIndex,
        dispenserNutType
      );
      // Prepend this step to all returned paths.
      for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        path.steps.unshift(step);
      }

      debugLog.debugLog(
        "Highlight",
        "Doug: findConnectingPaths paths = " + JSON.stringify(paths)
      );

      allPaths = allPaths.concat(paths);
      debugLog.debugLog(
        "Highlight",
        "Doug: findConnectingPaths allConnectingPaths = " +
          JSON.stringify(allPaths)
      );
    }

    return allPaths;
  }

  function highlightConnectingPath(connectingPath, color) {
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightConnectingPath connectingPath = " +
        JSON.stringify(connectingPath)
    );
    var steps = connectingPath.steps;

    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      var slot = step.slot;
      var conveyorTile = step.conveyorTile;

      debugLog.debugLog(
        "Highlight",
        "Doug: highlightConnectingPath step = " + JSON.stringify(step)
      );

      // Two possibilities:
      if (conveyorTile) {
        debugLog.debugLog(
          "Highlight",
          "Doug: highlightConnectingPath conveyorTile = " + conveyorTile.id
        );

        // There is a non-ghost conveyor tile here.
        // Tile has two belts thru it, only one is part of the path.
        // There are four possible belts classes:
        // .left (left to right cross).
        // .right (right to left cross).
        // .leftStraight (enter on left go down).
        // .rightStraight (enter on right go down).
        // Just find the belt with that name and highlight it.
        console.assert(
          step.conveyorTileBeltQuery,
          "conveyorTileBeltQuery should not be null"
        );
        var belts = query(step.conveyorTileBeltQuery, conveyorTile);
        var belt = belts[0];
        highlightQueryResult(belt, ".beltSegment", color);
      } else {
        // 1. There is no non-ghost conveyor tile on the board, just a slot which may or may not have some element (like the squirrel) on it.
        // Highlight the belt path on in that slot or the elements in the slot.
        console.assert(slot, "Slot should not be null");
        debugLog.debugLog(
          "Highlight",
          "Doug: highlightConnectingPath slot = " + slot.id
        );
        // Find the belt embedded on board, if any, on this space.
        var belts = query(".belt", slot);
        if (belts) {
          belt = belts[0];
          highlightQueryResult(belt, ".beltSegment", color);
        }
      }
    }
  }

  // For all of this:
  // ConnectingPath is
  // {
  //   steps: [step];
  // }
  // step is {
  //   slot: if non-null, path goes thru slot with no tile (maybe an element).  Highlight path in slot/element.
  //   conveyorTile: if non-null. path goes thru a tile on one side or the other.
  //   conveyorTileBeltQuery: tells us which belt to highlight.
  //  }
  // Eiter slot, or conveyorTile is non-null.
  //
  function highlightAllConnectingPaths(color) {
    // Terminal step: we are at box holders.
    boxHolderRowIndex = getIndexOfFirstRowOfType(rowTypes.BoxHolders);
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightAllConnectingPaths boxHolderRowIndex = " +
        boxHolderRowIndex
    );

    debugLog.debugLog(
      "Highlight",
      "Doug: highlightAllConnectingPaths color = " + color
    );
    var connectingPaths = findConnectingPaths();
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightAllConnectingPaths connectingPaths = " +
        JSON.stringify(connectingPaths)
    );

    for (var i = 0; i < connectingPaths.length; i++) {
      var connectingPath = connectingPaths[i];
      highlightConnectingPath(connectingPath, color);
    }
  }

  // This returned object becomes the defined value of this module
  return {
    storeConveyorTileData: storeConveyorTileData,
    highlightConveyorTile: highlightConveyorTile,
    highlightBoxHolder: highlightBoxHolder,
    highlightQueryResult: highlightQueryResult,
    highlightAllConnectingPaths: highlightAllConnectingPaths,
    storeTopBoxNutType: storeTopBoxNutType,
    getTopBoxNutType: getTopBoxNutType,
  };
});
