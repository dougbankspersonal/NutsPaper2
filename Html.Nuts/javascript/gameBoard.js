define([
  "dojo/dom",
  "dojo/query",
  "dojo/dom-style",
  "dojo/dom-class",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "sharedJavascript/systemConfigs",
  "javascript/beltUtils",
  "javascript/boxCards",
  "javascript/boxRobots",
  "javascript/conveyorTiles",
  "javascript/gameUtils",
  "javascript/machines",
  "javascript/machineTypes",
  "javascript/markers",
  "javascript/measurements",
  "javascript/nutTypes",
  "javascript/rowTypes",
  "dojo/domReady!",
], function (
  dom,
  query,
  domStyle,
  domClass,
  debugLog,
  genericUtils,
  htmlUtils,
  systemConfigs,
  beltUtils,
  boxCards,
  boxRobots,
  conveyorTiles,
  gameUtils,
  machines,
  machineTypes,
  markers,
  measurements,
  nutTypes,
  rowTypes
) {
  var rowZUIndex = 20;

  // A tile hits two slots.
  // Say first slot is row i, column j.
  // Then the tile is stored in conveyorTileIdsByRowThenColumn[i][j]
  var conveyorTileIdsByRowThenColumn = {};
  var addedConveyorTileIndex = 0;

  function addContent(parentNode) {
    var content = htmlUtils.addDiv(parentNode, ["content"], "content");
    return content;
  }

  var validRowConfigKeys = {
    // Classes to apply to the row.
    classArray: true,
    // Configs for elements in the row.
    elementConfigs: true,
    // Row has a dark background.
    darkBackground: true,
  };

  function sanityCheckRowConfigs(rowConfigs) {
    genericUtils.sanityCheckTable(rowConfigs, validRowConfigKeys);
  }

  var validElementConfigKeys = {
    // Should we even add an element?
    skipElement: true,
    // Elements are round or square.  Default to square.
    isRound: true,
    // Is this circle nth space for a particular thing?
    // E.g. Nth squirrel space.
    entityName: true,
    entityIndex: true,
    // Classes to apply to the element.
    classArray: true,
    // Function call to render non-standard element.
    tweakElement: true,
    beltConfigs: true,
  };

  function sanityCheckElementConfigs(elementConfigs) {
    genericUtils.sanityCheckTable(elementConfigs, validElementConfigKeys);
  }

  // Add a row to the current strip.
  // Return the 'content' sub-node of the row.
  function addRowToStripAndReturnRowContent(
    parentNode,
    rowIndex,
    rowType,
    opt_rowConfigs
  ) {
    var rowConfigs = opt_rowConfigs ? opt_rowConfigs : {};
    sanityCheckRowConfigs(rowConfigs);

    var darkBackground = rowConfigs.darkBackground ? true : false;
    var classArray = rowConfigs.classArray ? rowConfigs.classArray : [];

    var row = gameUtils.addRow(parentNode, classArray, rowIndex);
    htmlUtils.addStandardBorder(row);

    var finalHeight = measurements.getFactoryRowHeight(rowType);
    var finalZIndex = rowZUIndex;
    rowZUIndex--;

    // Adjust background position for new row.
    var backgroundPositionY = rowIndex * measurements.standardRowHeight;
    domStyle.set(row, {
      height: `${finalHeight}px`,
      "z-index": `${finalZIndex}`,
      "background-position": `center -${backgroundPositionY}px`,
    });

    if (darkBackground) {
      htmlUtils.addDiv(row, ["darkBackground"], "darkBackground");
    }

    var content = addContent(row);

    return content;
  }

  function applyStandardElementStyling(element) {
    domStyle.set(element, {
      width: `${measurements.elementWidth}px`,
      height: `${measurements.elementHeight}px`,
      "z-index": `${measurements.elementZIndex}`,
      "margin-top": `${measurements.elementTopAndBottomMargin}px`,
      "margin-left": `${measurements.elementLeftAndRightMargin}px`,
    });
  }

  // columnIndex is 0-based.
  function addNthElement(parentNode, columnIndex, classArray) {
    var extendedClassArray = genericUtils.growOptStringArray(
      classArray,
      "element"
    );
    var elementId = gameUtils.getElementId(columnIndex);
    var element = htmlUtils.addDiv(parentNode, extendedClassArray, elementId);

    applyStandardElementStyling(element);

    return element;
  }

  function addEntityNameAndIndex(parentNode, entityName, entityIndex) {
    var entityNameNode = htmlUtils.addDiv(
      parentNode,
      ["entityTitle"],
      "entityTitle",
      entityName
    );
    var entityIndexNode = htmlUtils.addDiv(
      parentNode,
      ["entityIndex"],
      "entityIndex",
      entityIndex
    );
    return { entityNameNode, entityIndexNode };
  }

  function addStandardSlot(parentNode, rowIndex, columnIndex) {
    var slotId = gameUtils.getSlotId(rowIndex, columnIndex);
    var classArray = ["slot"];
    var node = htmlUtils.addDiv(parentNode, classArray, slotId);
    domStyle.set(node, {
      width: `${measurements.slotWidth}px`,
    });
    return node;
  }

  function addStandardSlotWithNumber(parent, rowIndex, columnIndex) {
    var standardSlot = addStandardSlot(parent, rowIndex, columnIndex);
    var elementId = gameUtils.getElementId(columnIndex);
    // Column index is zero based: when we render the number we want it to start at one.
    var columnNumber = columnIndex + 1;
    var numberNode = htmlUtils.addDiv(
      standardSlot,
      ["number"],
      elementId,
      columnNumber
    );
    applyStandardElementStyling(numberNode);
    return standardSlot;
  }

  // How many columns will be in this strip?
  // totalColumnCount = all columns in board.
  // numColumnsAlreadyHandled = columns already handled in previous strips.
  // maxColumnsPerStrip = max we can handle.
  function getNumColumnsThisPage(
    totalColumnCount,
    maxColumnsPerPage,
    numColumnsAlreadyHandled
  ) {
    var numColumnsLeft = totalColumnCount - numColumnsAlreadyHandled;
    var retVal = Math.min(numColumnsLeft, maxColumnsPerPage);
    debugLog.debugLog(
      "GameBoard",
      "Doug: getNumColumnsThisStrip retVal = " + retVal
    );
    return retVal;
  }

  function addStandardSlotWithElementAndBelt(
    parentNode,
    rowIndex,
    columnIndex,
    elementConfigs
  ) {
    sanityCheckElementConfigs(elementConfigs);

    // Column index is 0-based.
    debugLog.debugLog(
      "GameBoard",
      "Doug: addStandardSlotWithElementAndBelt: rowIndex = " +
        rowIndex +
        " columnIndex = " +
        columnIndex
    );

    var classArray = elementConfigs.classArray;
    var tweakElement = elementConfigs.tweakElement;
    var isRound = elementConfigs.isRound;
    var skipElement = elementConfigs.skipElement;
    var entityName = elementConfigs.entityName;
    var entityIndex = elementConfigs.entityIndex;
    var standardSlot = addStandardSlot(parentNode, rowIndex, columnIndex);

    if (!skipElement) {
      var element = addNthElement(standardSlot, columnIndex, classArray);
      if (entityName && entityIndex) {
        addEntityNameAndIndex(element, entityName, entityIndex);
      }
      if (tweakElement) {
        tweakElement(element);
      }
      if (isRound) {
        domStyle.set(element, {
          "border-radius": "50%",
        });
      }
    }
    beltUtils.addStraightBelt(standardSlot, elementConfigs.beltConfigs);

    return standardSlot;
  }

  function addNColumnRowWithElements(
    parentNode,
    rowIndex,
    rowType,
    numColumnsThisPage,
    numColumnsAlreadyHandled,
    rowConfigs
  ) {
    sanityCheckRowConfigs(rowConfigs);

    debugLog.debugLog(
      "GameBoard",
      "Doug: addNColumnRowWithElements: rowIndex = " + rowIndex
    );
    debugLog.debugLog(
      "GameBoard",
      "Doug: addNColumnRowWithElements: numColumnsThisPage = " +
        numColumnsThisPage
    );
    debugLog.debugLog(
      "GameBoard",
      "Doug: addNColumnRowWithElements: numColumnsAlreadyHandled = " +
        numColumnsAlreadyHandled
    );

    var entityName = rowTypes.getRowEntityName(rowType);
    var content = addRowToStripAndReturnRowContent(
      parentNode,
      rowIndex,
      rowType,
      rowConfigs
    );
    var elementConfigs = rowConfigs.elementConfigs
      ? rowConfigs.elementConfigs
      : {};

    for (let i = 0; i < numColumnsThisPage; i++) {
      if (entityName) {
        elementConfigs.entityIndex = i + numColumnsAlreadyHandled + 1;
        elementConfigs.entityName = entityName;
      }
      addStandardSlotWithElementAndBelt(
        content,
        rowIndex,
        numColumnsAlreadyHandled + i,
        elementConfigs
      );
    }

    return content;
  }

  function addNColumnRowWithNumbers(
    parentNode,
    rowIndex,
    rowType,
    numColumnsThisPage,
    numColumnsAlreadyHandled,
    rowConfigs
  ) {
    sanityCheckRowConfigs(rowConfigs);
    debugLog.debugLog(
      "GameBoard",
      "Doug: addNColumnRowWithNumbers: numColumnsAlreadyHandled = " +
        numColumnsAlreadyHandled
    );
    var content = addRowToStripAndReturnRowContent(
      parentNode,
      rowIndex,
      rowType,
      rowConfigs
    );

    for (let i = 0; i < numColumnsThisPage; i++) {
      var columnIndex = numColumnsAlreadyHandled + i;
      addStandardSlotWithNumber(content, rowIndex, columnIndex);
    }
    return content;
  }

  function addNColumnRowWithConveyors(
    parentNode,
    rowIndex,
    rowType,
    numColumnsThisPage,
    numColumnsAlreadyHandled,
    rowConfigs
  ) {
    sanityCheckRowConfigs(rowConfigs);
    var content = addRowToStripAndReturnRowContent(
      parentNode,
      rowIndex,
      rowType,
      rowConfigs
    );

    var elementConfigs = rowConfigs.elementConfigs
      ? rowConfigs.elementConfigs
      : {};
    elementConfigs.skipElement = true;

    for (let i = 0; i < numColumnsThisPage; i++) {
      addStandardSlotWithElementAndBelt(
        content,
        rowIndex,
        numColumnsAlreadyHandled + i,
        elementConfigs
      );
    }
    return content;
  }

  function tweakBoxesRowCardSlot(node) {
    var cardSlotHeight =
      measurements.standardRowHeight / 2 - 2 * measurements.boxesRowMarginTop;
    domStyle.set(node, {
      width: `${measurements.smallCardWidth}px`,
      height: `${cardSlotHeight}px`,
      "margin-top": `${measurements.boxesRowMarginTop}px`,
      display: "block",
    });
  }

  // Adds one or more pages.
  // Each page holds at most numColumnsThisStrip columns.
  // Each page holds at most maxRowsPerPage rows.
  // Will do as many pages as needed to handle all the rows in orderedRowTypes.
  // Returns ([pages], number of columnsAdded)
  function addPagesWithNextNColumns(
    bodyNode,
    orderedRowTypes,
    maxRowsPerPage,
    totalNumColumns,
    maxColumnsPerPage,
    numColumnsAlreadyHandled
  ) {
    var allPageNodes = [];
    var numColumnsThisStrip = getNumColumnsThisPage(
      totalNumColumns,
      maxColumnsPerPage,
      numColumnsAlreadyHandled
    );
    var pageNode = htmlUtils.addPageOfItems(bodyNode);
    allPageNodes.push(pageNode);
    var currentPageNode = pageNode;

    var rowsThisPage = 0;
    for (let i = 0; i < orderedRowTypes.length; i++) {
      var rowIndex = i;
      var rowType = orderedRowTypes[i];

      if (rowsThisPage >= maxRowsPerPage) {
        currentPageNode = htmlUtils.addPageOfItems(bodyNode);
        allPageNodes.push(currentPageNode);
        rowsThisPage = 0;
      }

      switch (rowType) {
        case rowTypes.RowTypes.Number:
          addNColumnRowWithNumbers(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisStrip,
            numColumnsAlreadyHandled,
            {
              classArray: ["numbers"],
            }
          );
          break;
        case rowTypes.RowTypes.Dispenser:
          addNColumnRowWithElements(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisStrip,
            numColumnsAlreadyHandled,
            {
              classArray: ["nutDispensers"],
              elementConfigs: {
                beltConfigs: {
                  hideBeltTop: true,
                },
              },
            }
          );
          break;
        case rowTypes.RowTypes.Conveyor:
        case rowTypes.RowTypes.Path:
          addNColumnRowWithConveyors(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisStrip,
            numColumnsAlreadyHandled,
            {
              classArray: ["conveyors"],
            }
          );
          break;
        case rowTypes.RowTypes.Heart:
        case rowTypes.RowTypes.Skull:
        case rowTypes.RowTypes.Start:
        case rowTypes.RowTypes.End:
        case rowTypes.RowTypes.Salter:
        case rowTypes.RowTypes.Roaster:
        case rowTypes.RowTypes.Squirrel:
        case rowTypes.RowTypes.BoxRobots:
          addNColumnRowWithElements(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisStrip,
            numColumnsAlreadyHandled,
            {
              elementConfigs: {
                isRound: rowType == rowTypes.RowTypes.Squirrel,
                beltConfigs: {
                  hideBeltBottom: rowType == rowTypes.RowTypes.BoxRobots,
                },
              },
            }
          );
          break;
        case rowTypes.RowTypes.Boxes:
          addNColumnRowWithElements(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisStrip,
            numColumnsAlreadyHandled,
            {
              classArray: ["boxes"],
              darkBackground: true,
              elementConfigs: {
                classArray: ["cardSlot"],
                tweakElement: tweakBoxesRowCardSlot,
                beltConfigs: {
                  hideBeltBottom: true,
                },
              },
            }
          );
          break;
      }
      rowsThisPage++;
    }

    debugLog.debugLog(
      "GameBoard",
      "Doug: addPagesWithNextNColumns: at the end numColumnsThisPage = " +
        numColumnsThisStrip
    );
    return {
      allPageNodes: allPageNodes,
      numColumnsThisStrip: numColumnsThisStrip,
    };
  }

  function addGameBoard(configs) {
    var sc = systemConfigs.getSystemConfigs();
    // How many rows in this version of the game?
    var orderedRowTypes = configs.orderedRowTypes;
    // How many factory columns in this version of the game?
    var totalNumColumns = configs.totalNumColumns;

    // How many factory rows and columns per page?
    var maxRowsPerPage;
    if (configs.maxRowsPerPage) {
      maxRowsPerPage = configs.maxRowsPerPage;
    } else {
      maxRowsPerPage = orderedRowTypes.length;
    }

    var maxColumnsPerPage;
    if (configs.maxColumnsPerPage) {
      maxColumnsPerPage = configs.maxColumnsPerPage;
    } else {
      maxColumnsPerPage = totalNumColumns;
    }

    // Make the body node.
    var bodyNode = dom.byId("body");

    // Special case if we are doing all the columns in one go.
    if (sc.pageless || maxColumnsPerPage >= totalNumColumns) {
      var pageOfItemsContentsNode;
      var retVal = addPagesWithNextNColumns(
        bodyNode,
        orderedRowTypes,
        maxRowsPerPage,
        totalNumColumns,
        totalNumColumns,
        0
      );
      console.assert(retVal, "Doug: addGameBoard: retVal is null");
      console.assert(
        retVal.allPageNodes,
        "Doug: addGameBoard: retVal.allPageNodes is null"
      );
      var allPageNodes = retVal.allPageNodes;
      console.assert(
        allPageNodes.length == 1,
        "Doug: addGameBoard: allPageNodes.length = " + allPageNodes.length
      );
      var pageOfItemsContentsNode = allPageNodes[0];

      if (!(sc.pageOfItemsContentsPaddingPx > 0) && sc.pageless) {
        domStyle.set(pageOfItemsContentsNode, {
          padding: "0px",
        });
      }
    } else {
      var numColumnsAlreadyHandled = 0;
      while (numColumnsAlreadyHandled < totalNumColumns) {
        debugLog.debugLog(
          "GameBoard",
          "Doug: totalNumColumns = " + totalNumColumns
        );
        debugLog.debugLog(
          "GameBoard",
          "Doug: numColumnsAlreadyHandled = " + numColumnsAlreadyHandled
        );
        var retVal = addPagesWithNextNColumns(
          bodyNode,
          orderedRowTypes,
          maxRowsPerPage,
          totalNumColumns,
          maxColumnsPerPage,
          numColumnsAlreadyHandled
        );
        console.assert(retVal, "Doug: addGameBoard: retVal is null");
        console.assert(
          retVal.numColumnsThisStrip,
          "Doug: addGameBoard: retVal.numColumnsThisStrip is null"
        );
        var numColumns = retVal.numColumnsThisStrip;
        debugLog.debugLog("GameBoard", "Doug: numColumns = " + numColumns);
        numColumnsAlreadyHandled += numColumns;
        debugLog.debugLog(
          "GameBoard",
          "Doug: final numColumnsAlreadyHandled = " + numColumnsAlreadyHandled
        );
      }
    }
  }

  function fixupMarkerStyling(marker) {
    var style = {};
    style["margin"] = "0px";
    style["position"] = "absolute";
    domStyle.set(marker, style);
  }

  function fixupMachineStyling(machine) {
    var style = {};
    style["margin"] = "0px";
    style["position"] = "absolute";
    domStyle.set(machine, style);
  }

  // columnnIndex is 0-based, ignoring the sidebar.
  function addMarkerToBoard(
    rowIndex,
    columnIndex,
    markerType,
    opt_classArray,
    opt_additionalConfig
  ) {
    var rowId = gameUtils.getRowId(rowIndex);
    var rowNode = dom.byId(rowId);
    debugLog.debugLog("Markers", "Doug: addMarkerToBoard rowNode = " + rowNode);
    // add a marker to this element.
    var elementNode = gameUtils.getElementFromRow(rowNode, columnIndex);
    debugLog.debugLog(
      "Markers",
      "Doug: addMarkerToBoard elementNode = " + elementNode
    );
    // add marker here.
    var marker = markers.addMarker(
      elementNode,
      markerType,
      opt_classArray,
      opt_additionalConfig
    );
    debugLog.debugLog("Markers", "Doug: addMarkerToBoard marker = " + marker);
    fixupMarkerStyling(marker);
    return marker;
  }

  // columnnIndex is 0-based, ignoring the sidebar.
  function addMachineToBoard(rowIndex, columnIndex, machineType) {
    var rowId = gameUtils.getRowId(rowIndex);
    var rowNode = dom.byId(rowId);
    debugLog.debugLog(
      "Machines",
      "Doug: addMachineToBoard rowNode = " + rowNode
    );
    // add a machine to this element.
    var elementNode = gameUtils.getElementFromRow(rowNode, columnIndex);
    debugLog.debugLog(
      "Machines",
      "Doug: addMachineToBoard elementNode = " + elementNode
    );
    // add machine here.
    var machine = machines.addMachine(elementNode, machineType);
    debugLog.debugLog(
      "Machines",
      "Doug: addMachineToBoard machine = " + machine
    );
    fixupMachineStyling(machine);
    return machine;
  }

  function storeConveyorTileId(rowIndex, columnIndex, conveyorTileId) {
    var rowIndexString = "X_" + rowIndex.toString();
    var columnIndexString = "X_" + columnIndex.toString();

    if (!conveyorTileIdsByRowThenColumn[rowIndexString]) {
      conveyorTileIdsByRowThenColumn[rowIndexString] = {};
    }
    conveyorTileIdsByRowThenColumn[rowIndexString][columnIndexString] =
      conveyorTileId;
  }

  function getStoredConveyorTileId(rowIndex, columnIndex) {
    var rowIndexString = "X_" + rowIndex.toString();
    var columnIndexString = "X_" + columnIndex.toString();

    if (!conveyorTileIdsByRowThenColumn[rowIndexString]) {
      return null;
    }
    return conveyorTileIdsByRowThenColumn[rowIndexString][columnIndexString];
  }

  function getStoredConveyorTile(rowIndex, columnIndex) {
    var conveyorTileId = getStoredConveyorTileId(rowIndex, columnIndex);
    if (!conveyorTileId) {
      return null;
    }
    var conveyorTiles = query(`#${conveyorTileId}`);
    return conveyorTiles[0];
  }

  function getNextConveyorTileId() {
    return `conveyorTile_${addedConveyorTileIndex++}`;
  }

  function placeConveyorTileOnBoard(rowIndex, columnIndex, opt_classArray) {
    var slotId = gameUtils.getSlotId(rowIndex, columnIndex);
    var slot = dom.byId(slotId);
    var conveyorTileId = getNextConveyorTileId();
    var conveyorTile = conveyorTiles.addCrossTile(
      slot,
      conveyorTileId,
      opt_classArray
    );

    domStyle.set(conveyorTile, {
      "margin-left": `${measurements.conveyorTileOnBoardLeftMargin}px`,
      "margin-top": `${measurements.conveyorTileOnBoardTopMargin}px`,
      "z-index": `${measurements.conveyorTileZIndex}`,
    });

    storeConveyorTileId(rowIndex, columnIndex, conveyorTileId);

    return conveyorTile;
  }

  function getConveyorTileInSlot(rowIndex, columnIndex) {
    var conveyorTile = getStoredConveyorTile(rowIndex, columnIndex);
    if (conveyorTile) {
      return [conveyorTile, true];
    }
    conveyorTile = getStoredConveyorTile(rowIndex, columnIndex - 1);
    if (conveyorTile) {
      return [conveyorTile, false];
    }
    return [null, false];
  }

  function highlightNode(node, color, opt_options) {
    var options = opt_options ? opt_options : {};
    var extra = options.extra ? options.extra : false;
    var noShadow = options.noShadow ? options.noShadow : false;
    var variable = extra ? "30px" : "5px";
    if (noShadow) {
      domStyle.set(node, {
        "background-color": color,
      });
    } else {
      domStyle.set(node, {
        "box-shadow": `0 0 ${variable} ${variable} ${color}`,
        "background-color": color,
      });
    }
  }

  function highlightQueryResult(node, queryArg, color, opt_options) {
    var nodes = query(queryArg, node);
    for (var i = 0; i < nodes.length; i++) {
      var element = nodes[i];
      highlightNode(element, color, opt_options);
    }
  }

  function highlightConveyorTile(
    rowIndex,
    columnIndex,
    color,
    opt_translucentColor
  ) {
    var conveyorTile = getStoredConveyorTile(rowIndex, columnIndex);
    if (conveyorTile) {
      if (domClass.contains(conveyorTile, "ghost") && opt_translucentColor) {
        highlightNode(conveyorTile, opt_translucentColor, {
          extra: true,
        });
      } else {
        highlightNode(conveyorTile, color, {
          extra: true,
        });
      }
    }
  }

  function getSlotAndHighlightContents(rowIndex, columnIndex, color) {
    var slot = gameUtils.getSlot(rowIndex, columnIndex);
    if (!slot) {
      return null;
    }
    // highlight elements, markers, box cards in this slot.
    var elementId = gameUtils.getElementId(columnIndex);
    highlightQueryResult(slot, ".marker", color, {
      noShadow: true,
    });
    highlightQueryResult(slot, ".box_robot", color, {
      noShadow: true,
    });
    highlightQueryResult(slot, ".box", color);
    return slot;
  }

  function addToken(parent, color, text) {
    var node = htmlUtils.addDiv(parent, ["token"], "token");
    domStyle.set(node, {
      "background-color": color,
    });
    htmlUtils.addStandardBorder(node);

    htmlUtils.addDiv(node, ["text"], "text", text);

    return node;
  }

  function highlightElementAndBeltsInSlot(rowIndex, columnIndex, color) {
    var slot = getSlotAndHighlightContents(rowIndex, columnIndex, color);
    if (!slot) {
      return false;
    }

    // Find the tile, if any, on this space.
    var [conveyorTile, isLeft] = getConveyorTileInSlot(rowIndex, columnIndex);

    if (conveyorTile) {
      var beltQuery = isLeft ? ".belt.left" : ".belt.right";
      var belts = query(beltQuery, conveyorTile);
      var belt = belts[0];
      highlightQueryResult(belt, ".beltSegment", color);
    } else {
      // Find the belt embedded on board, if any, on this space.
      var belts = query(".belt", slot);
      if (belts) {
        belt = belts[0];
        highlightQueryResult(belt, ".beltSegment", color);
      }
    }
    return true;
  }

  function getColumnIndexNextRow(rowIndex, columnIndex) {
    var [conveyorTile, isLeft] = getConveyorTileInSlot(rowIndex, columnIndex);
    if (conveyorTile) {
      if (isLeft) {
        return columnIndex + 1;
      } else {
        return columnIndex - 1;
      }
    }
    return columnIndex;
  }

  function highlightPath(columnIndex, color) {
    // Go thru each row: find the slot on the path, highlight element and belt stuff in that slot.
    var columnIndexThisRow = columnIndex;
    // First row is numbers, skip that.
    var rowIndex = 1;
    while (true) {
      var success = highlightElementAndBeltsInSlot(
        rowIndex,
        columnIndexThisRow,
        color
      );
      if (!success) {
        break;
      }
      columnIndexThisRow = getColumnIndexNextRow(rowIndex, columnIndexThisRow);
      rowIndex++;
    }
  }

  // columnnIndex is 0-based, ignoring the sidebar.
  function addBox(nutType, rowIndex, columnIndex, opt_classArray) {
    debugLog.debugLog("Cards", "Doug: addBox nutType = " + nutType);
    var boxesRowId = gameUtils.getRowId(rowIndex);
    var boxesRow = dom.byId(boxesRowId);
    var element = gameUtils.getElementFromRow(boxesRow, columnIndex);
    // add an order card to this element.
    return boxCards.addBoxCardSingleNut(
      element,
      nutType,
      columnIndex,
      opt_classArray
    );
  }

  function addBoxRobotNotMatching(
    rowIndex,
    columnIndex,
    nutType,
    opt_classArray
  ) {
    var boxesRowId = gameUtils.getRowId(rowIndex);
    var boxesRow = dom.byId(boxesRowId);
    var element = gameUtils.getElementFromRow(boxesRow, columnIndex);

    // add an order card to this element.
    var card = boxRobots.addBoxRobotCard(element, columnIndex, opt_classArray);

    debugLog.debugLog(
      "Markers",
      "Doug: addBoxRobotNotMatching nutType = " + nutType
    );
    debugLog.debugLog(
      "Markers",
      "Doug: addBoxRobotNotMatching columnIndex = " + columnIndex
    );
    var numQuarterTurns = (columnIndex * columnIndex) % 4;
    debugLog.debugLog(
      "Markers",
      "Doug: addBoxRobotNotMatching numQuarterTurns = " + numQuarterTurns
    );

    // Now spin until the top nut is notNutType.
    var originalTopNutType = boxRobots.getTopNutType(columnIndex, 0);
    debugLog.debugLog(
      "Markers",
      "Doug: addBoxRobotNotMatching originalTopNutType = " + originalTopNutType
    );
    var newTopNutType = boxRobots.getTopNutType(columnIndex, numQuarterTurns);
    debugLog.debugLog(
      "Markers",
      "Doug: addBoxRobotNotMatching newTopNutType = " + newTopNutType
    );

    while (boxRobots.getTopNutType(columnIndex, numQuarterTurns) == nutType) {
      numQuarterTurns++;
      numQuarterTurns = numQuarterTurns % 4;
    }
    var finalTopNutType = boxRobots.getTopNutType(columnIndex, numQuarterTurns);
    debugLog.debugLog(
      "Markers",
      "Doug: addBoxRobotNotMatching final numQuarterTurns = " + numQuarterTurns
    );
    debugLog.debugLog(
      "Markers",
      "Doug: addBoxRobotNotMatching finalTopNutType = " + finalTopNutType
    );

    boxRobots.setQuarterTurns(card, numQuarterTurns);

    return card;
  }

  function addNutDispensersAndBoxRobots(orderedRowTypes, totalNumColumns) {
    // Add nut dispensers
    var dispenserRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.RowTypes.Dispenser
    );
    var boxRobotRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.RowTypes.BoxRobots
    );

    var numNutMachineTypes = machineTypes.orderedNutMachineTypes.length;
    for (var i = 0; i < totalNumColumns; i++) {
      var machineType =
        machineTypes.orderedNutMachineTypes[i % numNutMachineTypes];
      addMachineToBoard(dispenserRowIndex, i, machineType);
      addBoxRobotNotMatching(boxRobotRowIndex, i, machineType);
    }
  }

  // This returned object becomes the defined value of this module
  return {
    // Can be used to make a board in sections or a complete board.
    addGameBoard: addGameBoard,

    addMarkerToBoard: addMarkerToBoard,
    addMachineToBoard: addMachineToBoard,
    addBox: addBox,
    placeConveyorTileOnBoard: placeConveyorTileOnBoard,
    highlightPath: highlightPath,
    highlightQueryResult: highlightQueryResult,
    highlightConveyorTile: highlightConveyorTile,
    getSlotAndHighlightContents: getSlotAndHighlightContents,
    addToken: addToken,
    addBoxRobotNotMatching: addBoxRobotNotMatching,
    addNutDispensersAndBoxRobots: addNutDispensersAndBoxRobots,
  };
});
