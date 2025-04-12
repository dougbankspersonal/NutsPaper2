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
    splitsToTheLeft,
    conveyorTileType,
    opt_classArray
  ) {
    console.assert(isConveyorTileType(conveyorTileType), "Invalid tile type");

    var extraClasses = [];

    var classArray = genericUtils.growOptStringArray(
      opt_classArray,
      extraClasses
    );

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
