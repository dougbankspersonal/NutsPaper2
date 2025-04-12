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
  "javascript/boxHolders",
  "javascript/conveyorTiles",
  "javascript/gameUtils",
  "javascript/machines",
  "javascript/machineTypes",
  "javascript/markers",
  "javascript/measurements",
  "javascript/rowTypes",
  "javascript/versionDetails",
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
  boxHolders,
  conveyorTiles,
  gameUtils,
  machines,
  machineTypes,
  markers,
  measurements,
  rowTypes,
  versionDetails
) {
  var conveyorTileTypes = {
    Splitter: "Splitter",
    Joiner: "Joiner",
    Cross: "Cross",
  };

  function isConveyorTileType(conveyorTileType) {
    return conveyorTileTypes[conveyorTileType] != null;
  }

  var rowZUIndex = 20;

  // A tile hits two slots.
  // Say first slot is row i, column j.
  // Then the tile is stored in conveyorTileDataByRowThenColumn[i][j]
  var conveyorTileDataByRowThenColumn = {};

  var boxHolderTopMostNutTypeByColumn = [];

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
    debugLog.debugLog(
      "GameBoard",
      "Doug: getNumColumnsThisStrip totalColumnCount = " + totalColumnCount
    );
    debugLog.debugLog(
      "GameBoard",
      "Doug: getNumColumnsThisStrip maxColumnsPerPage = " + maxColumnsPerPage
    );
    debugLog.debugLog(
      "GameBoard",
      "Doug: getNumColumnsThisStrip numColumnsAlreadyHandled = " +
        numColumnsAlreadyHandled
    );
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
    var numColumnsThisPage = getNumColumnsThisPage(
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
            numColumnsThisPage,
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
            numColumnsThisPage,
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
            numColumnsThisPage,
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
        case rowTypes.RowTypes.BoxHolders:
          addNColumnRowWithElements(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisPage,
            numColumnsAlreadyHandled,
            {
              elementConfigs: {
                isRound: rowType == rowTypes.RowTypes.Squirrel,
                beltConfigs: {
                  hideBeltBottom: rowType == rowTypes.RowTypes.BoxHolders,
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
        numColumnsThisPage
    );
    return {
      allPageNodes: allPageNodes,
      numColumnsThisStrip: numColumnsThisPage,
    };
  }

  function addEntireGameBoardInOneDiv(bodyNode, orderedRowTypes, numColumns) {
    debugLog.debugLog("GameBoard", "Doug: addEntireGameBoardInOneDiv");
    var sc = systemConfigs.getSystemConfigs();

    var pageOfItemsContentsNode;
    var retVal = addPagesWithNextNColumns(
      bodyNode,
      orderedRowTypes,
      orderedRowTypes.length,
      numColumns,
      numColumns,
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

    if (!(sc.pageOfItemsContentsPaddingPx > 0) && sc.demoBoard) {
      domStyle.set(pageOfItemsContentsNode, {
        padding: "0px",
      });
    }
  }

  function addGameBoardInPages(
    bodyNode,
    orderedRowTypes,
    totalNumColumns,
    maxRowsPerPage,
    maxColumnsPerPage
  ) {
    debugLog.debugLog("GameBoard", "Doug: addGameBoardInPages");
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

  function addGameBoard(configs) {
    var sc = systemConfigs.getSystemConfigs();

    debugLog.debugLog(
      "GameBoard",
      "Doug: addGameBoard: sc = " + JSON.stringify(sc)
    );

    debugLog.debugLog(
      "GameBoard",
      "Doug: addGameBoard: configs = " + JSON.stringify(configs)
    );

    // How many rows in this version of the game?
    var orderedRowTypes = configs.orderedRowTypes;
    // How many factory columns in this version of the game?
    var totalNumColumns = configs.totalNumColumns;
    debugLog.debugLog(
      "GameBoard",
      "Doug: addGameBoard: totalNumColumns = " + totalNumColumns
    );

    // How many factory rows and columns per page?
    var maxRowsPerPage;
    if (sc.maxRowsPerPage) {
      maxRowsPerPage = sc.maxRowsPerPage;
    } else {
      maxRowsPerPage = orderedRowTypes.length;
    }
    debugLog.debugLog("GameBoard", "Doug: maxRowsPerPage = " + maxRowsPerPage);

    var maxColumnsPerPage;
    if (sc.maxColumnsPerPage) {
      maxColumnsPerPage = sc.maxColumnsPerPage;
    } else {
      maxColumnsPerPage = totalNumColumns;
    }
    debugLog.debugLog(
      "GameBoard",
      "Doug: maxColumnsPerPage = " + maxColumnsPerPage
    );

    // Make the body node.
    var bodyNode = dom.byId("body");

    debugLog.debugLog(
      "GameBoard",
      "Doug: totalNumColumns = " + totalNumColumns
    );
    // Special case if we are doing all the columns in one go.
    if (sc.demoBoard || maxColumnsPerPage >= totalNumColumns) {
      addEntireGameBoardInOneDiv(bodyNode, orderedRowTypes, totalNumColumns);
    } else {
      addGameBoardInPages(
        bodyNode,
        orderedRowTypes,
        totalNumColumns,
        maxRowsPerPage,
        maxColumnsPerPage
      );
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
    debugLog.debugLog(
      "Markers",
      "Doug: addMarkerToBoard rowIndex = " + rowIndex
    );
    debugLog.debugLog(
      "Markers",
      "Doug: addMarkerToBoard columnIndex = " + columnIndex
    );
    var rowId = gameUtils.getRowId(rowIndex);
    var rowNode = dom.byId(rowId);
    console.assert(rowNode, "Doug: rowNode is null");
    var elementNode = gameUtils.getElementFromRow(rowNode, columnIndex);
    console.assert(elementNode, "Doug: elementNode is null");
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

  /* Data is of the form:
  {
    conveyorTileId: conveyorTileId
    configs: configs
  }
  */
  function storeConveyorTileData(
    rowIndex,
    columnIndex,
    conveyorTileId,
    opt_configs
  ) {
    var configs = opt_configs ? opt_configs : {};
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
      "Doug: storeConveyorTileData configs = " + JSON.stringify(configs)
    );

    var rowIndexString = "X_" + rowIndex.toString();
    var columnIndexString = "X_" + columnIndex.toString();

    if (!conveyorTileDataByRowThenColumn[rowIndexString]) {
      conveyorTileDataByRowThenColumn[rowIndexString] = {};
    }
    conveyorTileDataByRowThenColumn[rowIndexString][columnIndexString] = {
      conveyorTileId: conveyorTileId,
      configs: configs,
    };
  }

  /* Data is of the form:
  {
    conveyorTileId: conveyorTileId
    configs: configs
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

  // Get the conveyor tile plus configs.
  function getStoredConveyorTileAndConfigs(rowIndex, columnIndex) {
    var conveyorData = getStoredConveyorData(rowIndex, columnIndex);
    if (!conveyorData) {
      return null;
    }

    var conveyorTileId = conveyorData.conveyorTileId;
    var conveyorTiles = query(`#${conveyorTileId}`);
    var tile = conveyorTiles[0];
    return {
      tile: tile,
      configs: conveyorData.configs,
    };
  }

  function getNextConveyorTileId() {
    return `conveyorTile_${addedConveyorTileIndex++}`;
  }

  function placeConveyorTileOnBoard(
    rowIndex,
    columnIndex,
    opt_conveyorTileType,
    opt_classArray
  ) {
    var conveyorTileType = opt_conveyorTileType
      ? opt_conveyorTileType
      : conveyorTileTypes.Cross;

    console.assert(isConveyorTileType(conveyorTileType), "Invalid tile type");

    var extraClasses = [];
    var classArray = genericUtils.growOptStringArray(
      opt_classArray,
      extraClasses
    );

    var slotId = gameUtils.getSlotId(rowIndex, columnIndex);
    var slot = dom.byId(slotId);
    var conveyorTileId = getNextConveyorTileId();

    var conveyorTile;
    if (conveyorTileType == conveyorTileTypes.Cross) {
      conveyorTile = conveyorTiles.addCrossTile(
        slot,
        conveyorTileId,
        classArray
      );
    } else if (conveyorTileType == conveyorTileTypes.SplitterLeft) {
      conveyorTile = conveyorTiles.addSplitterLeftTile(
        slot,
        conveyorTileId,
        classArray
      );
    } else if (conveyorTileType == conveyorTileTypes.SplitterRight) {
      conveyorTile = conveyorTiles.addSplitterRightTile(
        slot,
        conveyorTileId,
        classArray
      );
    } else if (conveyorTileType == conveyorTileTypes.JoinerLeft) {
      conveyorTile = conveyorTiles.addSJoinerLeftTile(
        slot,
        conveyorTileId,
        classArray
      );
    } else if (conveyorTileType == conveyorTileTypes.SplitterLeft) {
      conveyorTile = conveyorTiles.addJoinerRightTile(
        slot,
        conveyorTileId,
        classArray
      );
    }

    domStyle.set(conveyorTile, {
      "margin-left": `${measurements.conveyorTileOnBoardLeftMargin}px`,
      "margin-top": `${measurements.conveyorTileOnBoardTopMargin}px`,
      "z-index": `${measurements.conveyorTileZIndex}`,
    });

    var isGhost = false;
    if (domClass.contains(conveyorTile, "ghost")) {
      isGhost = true;
    }

    storeConveyorTileData(rowIndex, columnIndex, conveyorTileId, {
      isGhost: isGhost,
      splitsToTheLeft: splitsToTheLeft,
      conveyorTileType: conveyorTileType,
    });

    return conveyorTile;
  }

  function placeSplitterJoinerTileOnBoard(
    rowIndex,
    columnIndex,
    splitsToTheLeft,
    conveyorTileType,
    opt_classArray
  ) {
    return placeConveyorTileOnBoard(
      rowIndex,
      columnIndex,
      splitsToTheLeft,
      conveyorTileType,
      opt_classArray
    );
  }

  function placeConveyorTileOnBoard(rowIndex, columnIndex, opt_classArray) {
    return placeConveyorTileOnBoard(
      rowIndex,
      columnIndex,
      false,
      conveyorTileTypes.Cross,
      opt_classArray
    );
  }

  // Which tiles hit this slot?
  // Only one normal tile.
  // Possible that ghost tiles hit too.
  // returns {
  //   left: left
  //   right: right
  // }
  // Where left and right are both of the form
  // {
  //   tile: tile
  //   configs: configs
  // }
  // Left or right or both may be null.
  function getConveyorTilesAndConfigsInSlot(rowIndex, columnIndex) {
    var leftConveyorTileAndConfigs = getStoredConveyorTileAndConfigs(
      rowIndex,
      columnIndex
    );

    // Try right side.
    var rightConveyorTileAndConfigs = getStoredConveyorTileAndConfigs(
      rowIndex,
      columnIndex - 1
    );

    return {
      left: leftConveyorTileAndConfigs,
      right: rightConveyorTileAndConfigs,
    };
  }

  function highlightNode(node, color, opt_options) {
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
      "Doug: highlightQueryResult queryArg = " + queryArg
    );
    var nodes = query(queryArg, node);
    for (var i = 0; i < nodes.length; i++) {
      var element = nodes[i];
      highlightNode(element, color, opt_options);
    }
    return nodes.length;
  }

  function getIndexOfFirstRowOfType(rowType) {
    var orderedRowTypes = versionDetails.getOrderedRowTypes();
    var boxHolderRowIndex = 0;
    for (var i = 0; i < orderedRowTypes.length; i++) {
      debugLog.debugLog("Highlight", "Doug: getIndexOfFirstRowOfType i = " + i);
      debugLog.debugLog(
        "Highlight",
        "Doug: orderedRowTypes[i] = " + orderedRowTypes[i]
      );
      debugLog.debugLog(
        "Highlight",
        "Doug: rowTypes.RowTypes.BoxHolders = " + rowTypes.RowTypes.BoxHolders
      );

      if (orderedRowTypes[i] == rowTypes.RowTypes.BoxHolders) {
        debugLog.debugLog(
          "Highlight",
          "Doug: orderedRowTypes[i] matches rowType = " + rowType
        );
        return i;
      }
    }
    return null;
  }

  function highlightBoxHolder(columnIndex, highlightColor) {
    var orderedRowTypes = versionDetails.getOrderedRowTypes();
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightBoxHolder orderedRowTypes = " +
        JSON.stringify(orderedRowTypes)
    );

    var boxHolderRowIndex = getIndexOfFirstRowOfType(
      rowTypes.RowTypes.BxoHolders
    );
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
    var conveyorTileAndConfigs = getStoredConveyorTileAndConfigs(
      rowIndex,
      columnIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightConveyorTile: conveyorTileAndConfigs = " +
        JSON.stringify(conveyorTileAndConfigs)
    );

    // No tile, we're done.
    if (!conveyorTileAndConfigs) {
      return;
    }

    // Get the tile.
    var conveyorTile = conveyorTileAndConfigs.tile;

    console.assert(conveyorTile);

    highlightNode(conveyorTile, color, {
      extra: true,
    });
  }

  function getSlotAndHighlightContents(rowIndex, columnIndex, color) {
    var slot = gameUtils.getSlot(rowIndex, columnIndex);
    if (!slot) {
      return null;
    }
    // highlight elements, markers, box cards in this slot.
    var elementId = gameUtils.getElementId(columnIndex);
    highlightQueryResult(slot, ".marker", color, {});
    highlightQueryResult(slot, ".box_holder", color, {});
    highlightQueryResult(slot, ".box", color);
    return slot;
  }

  // conveyorTilesAndConfigs contains at most two tiles, left and right.
  // At most one of these can be non-ghost.
  // Find and return that one.
  // Also return if we come into this tile on the left or right of the tile (2nd arg true = coming in on left)
  function getNonGhostTileInConveyorTilesAndConfigs(conveyorTilesAndConfigs) {
    if (!conveyorTilesAndConfigs) {
      return [null, false];
    }

    var left = conveyorTilesAndConfigs.left;
    var right = conveyorTilesAndConfigs.right;

    if (left && left.tile && !left.configs.isGhost) {
      return [left, true];
    }

    if (right && right.tile && !right.configs.isGhost) {
      return [right, false];
    }

    return [null, false];
  }

  function highlightCrossTileBelts(conveyorTile, comingInOnLeft, color) {
    // Cross is X.
    // Highlight the belt that starts from where we came in.
    // Note that .belt.left means it starts on left and exits right.
    var beltQuery = comingInOnLeft ? ".belt.left" : ".belt.right";
    var belts = query(beltQuery, conveyorTile);
    var belt = belts[0];
    highlightQueryResult(belt, ".beltSegment", color);
  }

  function highlightJoinerTileBelts(
    conveyorTile,
    comingInOnLeft,
    splitsToTheLeft,
    color
  ) {
    // Joiner is either |/ or \|.
    // Highlight the belt that starts from where we came in.
    // Remember joiner is upside down splitter so splitsToTheLeft is
    // |/
    // and not-splitsToTheLeft is
    // \|
    var beltQuery;
    // Note that .belt.left means it starts on left and exits right.
    if (comingInOnLeft) {
      if (splitsToTheLeft) {
        beltQuery = ".belt.straight";
      } else {
        beltQuery = ".belt.left";
      }
    } else {
      if (splitsToTheLeft) {
        beltQuery = ".belt.right";
      } else {
        beltQuery = ".belt.straight";
      }
    }
    var belts = query(beltQuery, conveyorTile);
    var belt = belts[0];
    highlightQueryResult(belt, ".beltSegment", color);
  }

  function highlightSplitterTileBelts(
    conveyorTile,
    comingInOnLeft,
    splitsToTheLeft,
    color
  ) {
    // Splitter.  |\ or /|.
    // Note that .belt.left means it starts on left and exits right.
    if (!splitsToTheLeft && comingInOnLeft) {
      var beltQuery = ".belt.left";
      var belts = query(beltQuery, conveyorTile);
      var belt = belts[0];
      console.assert(belt, "Doug: belt is null");
      debugLog.debugLog(
        "Highlight",
        "Doug: highlightSplitterTileBelts belts.length = " + belts.length
      );
      highlightQueryResult(belt, ".beltSegment", color);
      beltQuery = ".belt.straight";
      belts = query(beltQuery, conveyorTile);
      belt = belts[0];
      highlightQueryResult(belt, ".beltSegment", color);
    }
    if (splitsToTheLeft && !comingInOnLeft) {
      var beltQuery = ".belt.right";
      var belts = query(beltQuery, conveyorTile);
      var belt = belts[0];
      highlightQueryResult(belt, ".beltSegment", color);
      beltQuery = ".belt.straight";
      belts = query(beltQuery, conveyorTile);
      belt = belts[0];
      highlightQueryResult(belt, ".beltSegment", color);
    }
  }

  function highlightPathThroughSlot(rowIndex, columnIndex, color) {
    var slot = getSlotAndHighlightContents(rowIndex, columnIndex, color);
    if (!slot) {
      return false;
    }

    // Find the tiles that cross this spot.
    var conveyorTilesAndConfigs = getConveyorTilesAndConfigsInSlot(
      rowIndex,
      columnIndex
    );

    // Find the non-ghost, if any, in results.
    var result = getNonGhostTileInConveyorTilesAndConfigs(
      conveyorTilesAndConfigs
    );
    var conveyorTileAndConfigs = result[0];
    var comingInOnLeft = result[1];

    if (conveyorTileAndConfigs && conveyorTileAndConfigs.tile) {
      var conveyorTile = conveyorTileAndConfigs.tile;
      var splitsToTheLeft = conveyorTileAndConfigs.configs.splitsToTheLeft;
      var conveyorTileType = conveyorTileAndConfigs.configs.conveyorTileType;

      // Highlight the tile itself.
      highlightNode(conveyorTile, color, {
        extra: true,
      });

      // Look at tile type to know what belts get highlighted.
      if (conveyorTileType == conveyorTileTypes.Cross) {
        highlightCrossTileBelts(conveyorTile, comingInOnLeft, color);
      } else if (conveyorTileType == conveyorTileTypes.Joiner) {
        highlightJoinerTileBelts(
          conveyorTile,
          comingInOnLeft,
          splitsToTheLeft,
          color
        );
      } else {
        highlightSplitterTileBelts(
          conveyorTile,
          comingInOnLeft,
          splitsToTheLeft,
          color
        );
      }
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

  // The only thing path in does is come out one column to the right.
  function pathInCrossesRightOnly(conveyorTileAndConfigs, comingInOnLeft) {
    // If we are coming in on the right, never: no way to go up.
    if (!comingInOnLeft) {
      return false;
    }

    // No tile?  Then no, we don't move.
    if (!conveyorTileAndConfigs) {
      return false;
    }

    // So we are coming in on the left of some tile. When true that we only come out
    // on the right?
    // X  : yes.
    if (
      conveyorTileAndConfigs.configs.conveyorTileType == conveyorTileTypes.Cross
    ) {
      return true;
    }
    // |/ : no;
    // \| : yes;
    if (
      conveyorTileAndConfigs.configs.conveyorTileType ==
      conveyorTileTypes.Joiner
    ) {
      // Coming in to a joiner.  Depends on splitsToTheLeft comingInOnLeft.
      // Remember joiner is upside down splitter so splits left means joins right.
      return conveyorTileAndConfigs.configs.splitsToTheLeft;
    }

    // |\ : no;
    // /| : no;
    return false;
  }

  // The only thing path in does is come out one column to the left.
  function pathInCrossesLeftOnly(conveyorTileAndConfigs, comingInOnLeft) {
    // If we are coming in on the left, never: no way to go down.
    if (comingInOnLeft) {
      return false;
    }

    // No tile?  Then no, we don't move.
    if (!conveyorTileAndConfigs) {
      return false;
    }

    // So we are coming in on the right of some tile. When true that we only come out
    // on the left?
    // X  : yes.
    if (
      conveyorTileAndConfigs.configs.conveyorTileType == conveyorTileTypes.Cross
    ) {
      return true;
    }
    // |/ : yes;
    // \| : no;
    if (
      conveyorTileAndConfigs.configs.conveyorTileType ==
      conveyorTileTypes.Joiner
    ) {
      // Coming in to a joiner.  Depends on splitsToTheLeft and which comingInOnLeft.
      // Remember joiner is upside down splitter so splits left means joins right.
      return !conveyorTileAndConfigs.configs.splitsToTheLeft;
    }

    // |\ : no;
    // /| : no;
    return false;
  }

  // The only thing path in does dead end.
  // Only possible with splitter tiles.
  function pathInDeadEnds(conveyorTileAndConfigs, comingInOnLeft) {
    // No tile?  Then no, we don't move.
    if (!conveyorTileAndConfigs) {
      return false;
    }

    if (
      conveyorTileAndConfigs.configs.conveyorTileType !=
      conveyorTileTypes.Splitter
    ) {
      return false;
    }

    // It's either |\ or /|.  So it depends where we come in and splits right or left.
    // /|: yes if coming in on left.
    if (comingInOnLeft && conveyorTileAndConfigs.configs.splitsToTheLeft) {
      return true;
    }
    // |\ : yes if coming in on right.
    if (!comingInOnLeft && !conveyorTileAndConfigs.configs.splitsToTheLeft) {
      return true;
    }

    return false;
  }

  function pathInSplitsRight(conveyorTileAndConfigs, comingInOnLeft) {
    // No tile?  Then no.
    if (!conveyorTileAndConfigs) {
      return false;
    }

    if (
      conveyorTileAndConfigs.configs.conveyorTileType !=
      conveyorTileTypes.Splitter
    ) {
      return false;
    }

    // Must be this: |\
    if (comingInOnLeft && !conveyorTileAndConfigs.configs.splitsToTheLeft) {
      return true;
    }

    return false;
  }

  function pathInSplitsLeft(conveyorTileAndConfigs, comingInOnLeft) {
    debugLog.debugLog("Highlight", "Doug: pathInSplitsLeft 001");
    // No tile?  Then no.
    if (!conveyorTileAndConfigs) {
      debugLog.debugLog("Highlight", "Doug: pathInSplitsLeft 002");
      return false;
    }

    if (
      conveyorTileAndConfigs.configs.conveyorTileType !=
      conveyorTileTypes.Splitter
    ) {
      debugLog.debugLog("Highlight", "Doug: pathInSplitsLeft 003");
      return false;
    }

    // Must be this: /|
    if (!comingInOnLeft && conveyorTileAndConfigs.configs.splitsToTheLeft) {
      debugLog.debugLog("Highlight", "Doug: pathInSplitsLeft 004");
      return true;
    }

    debugLog.debugLog("Highlight", "Doug: pathInSplitsLeft 005");
    return false;
  }

  // This row, this column: a path is coming in.  where does it come out?
  // In light of splitter/joiner it might come out zero, one, or two places.
  function getColumnIndicesNextRow(rowIndex, columnIndex) {
    debugLog.debugLog(
      "Highlight",
      "Doug: getColumnIndicesNextRow rowIndex = " + rowIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: getColumnIndicesNextRow columnIndex = " + columnIndex
    );
    var conveyorTilesAndConfigs = getConveyorTilesAndConfigsInSlot(
      rowIndex,
      columnIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: getColumnIndicesNextRow conveyorTilesAndConfigs = " +
        JSON.stringify(conveyorTilesAndConfigs)
    );

    var result = getNonGhostTileInConveyorTilesAndConfigs(
      conveyorTilesAndConfigs
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: getColumnIndicesNextRow result = " + JSON.stringify(result)
    );

    var conveyorTileAndConfigs = result[0];
    var comingInOnLeft = result[1];

    if (pathInCrossesRightOnly(conveyorTileAndConfigs, comingInOnLeft)) {
      debugLog.debugLog(
        "Highlight",
        "Doug: getColumnIndicesNextRow pathInCrossesRight"
      );
      return [columnIndex + 1];
    }
    if (pathInCrossesLeftOnly(conveyorTileAndConfigs, comingInOnLeft)) {
      debugLog.debugLog(
        "Highlight",
        "Doug: getColumnIndicesNextRow pathInCrossesLeft"
      );
      return [columnIndex - 1];
    }
    if (pathInDeadEnds(conveyorTileAndConfigs, comingInOnLeft)) {
      debugLog.debugLog(
        "Highlight",
        "Doug: getColumnIndicesNextRow pathInDeadEnds"
      );
      return [];
    }
    if (pathInSplitsRight(conveyorTileAndConfigs, comingInOnLeft)) {
      debugLog.debugLog(
        "Highlight",
        "Doug: getColumnIndicesNextRow pathInSplitsRight"
      );
      return [columnIndex, columnIndex + 1];
    }
    if (pathInSplitsLeft(conveyorTileAndConfigs, comingInOnLeft)) {
      debugLog.debugLog(
        "Highlight",
        "Doug: getColumnIndicesNextRow pathInSplitsLeft"
      );
      return [columnIndex - 1, columnIndex];
    }
    debugLog.debugLog("Highlight", "Doug: getColumnIndicesNextRow base case");
    return [columnIndex];
  }

  function highlightPathRecursive(rowIndex, columnIndex, color) {
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightPathRecursive rowIndex = " + rowIndex
    );
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightPathRecursive columnIndex = " + columnIndex
    );
    var success = highlightPathThroughSlot(rowIndex, columnIndex, color);
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightPathRecursive success = " + success
    );

    if (!success) {
      return;
    }
    var nextColumnIndices = getColumnIndicesNextRow(rowIndex, columnIndex);
    debugLog.debugLog(
      "Highlight",
      "Doug: highlightPathRecursive nextColumnIndices = " +
        JSON.stringify(nextColumnIndices)
    );

    rowIndex++;
    for (var i = 0; i < nextColumnIndices.length; i++) {
      var nextColumnIndex = nextColumnIndices[i];
      highlightPathRecursive(rowIndex, nextColumnIndex, color);
    }
  }

  function DEPRECATED_highlightPath(columnIndex, color) {
    debugLog.debugLog(
      "Highlight",
      "Doug: DEPRECATED_highlightPath columnIndex = " + columnIndex
    );
    // First row is numbers, skip that.
    var rowIndex = 1;
    highlightPathRecursive(rowIndex, columnIndex, color);
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

  function addBoxHolderWithNumQuarterRightTurns(
    rowIndex,
    columnIndex,
    numQuarterRightTurns,
    opt_classArray
  ) {
    var boxesRowId = gameUtils.getRowId(rowIndex);
    var boxesRow = dom.byId(boxesRowId);
    var element = gameUtils.getElementFromRow(boxesRow, columnIndex);

    // add an order card to this element.
    var card = boxHolders.addBoxHolderCard(
      element,
      columnIndex,
      opt_classArray
    );

    debugLog.debugLog(
      "GameBoard",
      "Doug: addBoxHolderWithNumQuarterRightTurns columnIndex = " + columnIndex
    );

    debugLog.debugLog(
      "GameBoard",
      "Doug: addBoxHolderWithNumQuarterRightTurns final numQuarterTurns = " +
        numQuarterRightTurns
    );

    boxHolders.setQuarterTurns(card, numQuarterRightTurns);

    // Record the type of nut on top of the box holder.
    var boxHolderCardConfig = boxHolders.boxHolderCardConfigs[columnIndex];
    var boxHolderTopMostNutType =
      boxHolderCardConfig.orderOfNuts[numQuarterRightTurns];
    boxHolderTopMostNutTypeByColumn[columnIndex] = boxHolderTopMostNutType;

    return card;
  }

  function addBoxHolderNotMatching(
    rowIndex,
    columnIndex,
    nutType,
    opt_classArray
  ) {
    // Start with some random index.
    var numQuarterRightTurns = (columnIndex * columnIndex) % 4;
    debugLog.debugLog(
      "GameBoard",
      "Doug: addBoxHolderNotMatching numQuarterRightTurns = " +
        numQuarterRightTurns
    );

    // Now spin until the top nut is notNutType.
    var originalTopNutType = boxHolders.getTopNutType(columnIndex, 0);
    debugLog.debugLog(
      "GameBoard",
      "Doug: addBoxHolderNotMatching originalTopNutType = " + originalTopNutType
    );
    var newTopNutType = boxHolders.getTopNutType(
      columnIndex,
      numQuarterRightTurns
    );
    debugLog.debugLog(
      "GameBoard",
      "Doug: addBoxHolderNotMatching newTopNutType = " + newTopNutType
    );

    while (
      boxHolders.getTopNutType(columnIndex, numQuarterRightTurns) == nutType
    ) {
      numQuarterRightTurns++;
      numQuarterRightTurns = numQuarterRightTurns % 4;
    }

    var card = addBoxHolderWithNumQuarterRightTurns(
      rowIndex,
      columnIndex,
      numQuarterRightTurns,
      opt_classArray
    );

    return card;
  }

  function addNutDispensersAndBoxHolders(
    orderedRowTypes,
    totalNumColumns,
    opt_numQuarterRightTurns
  ) {
    // Add nut dispensers
    var dispenserRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.RowTypes.Dispenser
    );
    var boxHolderRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.RowTypes.BoxHolders
    );

    var numNutMachineTypes = machineTypes.orderedNutMachineTypes.length;
    for (var i = 0; i < totalNumColumns; i++) {
      var machineType =
        machineTypes.orderedNutMachineTypes[i % numNutMachineTypes];
      addMachineToBoard(dispenserRowIndex, i, machineType);

      if (opt_numQuarterRightTurns) {
        console.assert(
          opt_numQuarterRightTurns.length == totalNumColumns,
          "should match"
        );
        var numQuarterRightTurns = opt_numQuarterRightTurns[i];
        addBoxHolderWithNumQuarterRightTurns(
          boxHolderRowIndex,
          i,
          numQuarterRightTurns
        );
      } else {
        addBoxHolderNotMatching(boxHolderRowIndex, i, machineType);
      }
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
    placeSplitterJoinerTileOnBoard: placeSplitterJoinerTileOnBoard,
    DEPRECATED_highlightPath: DEPRECATED_highlightPath,
    highlightQueryResult: highlightQueryResult,
    highlightConveyorTile: highlightConveyorTile,
    highlightBoxHolder: highlightBoxHolder,

    getSlotAndHighlightContents: getSlotAndHighlightContents,
    addBoxHolderWithNumQuarterRightTurns: addBoxHolderWithNumQuarterRightTurns,
    addBoxHolderNotMatching: addBoxHolderNotMatching,
    addNutDispensersAndBoxHolders: addNutDispensersAndBoxHolders,

    conveyorTileTypes: conveyorTileTypes,
  };
});
