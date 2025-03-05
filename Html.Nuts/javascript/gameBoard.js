define([
  "dojo/dom",
  "dojo/query",
  "dojo/dom-style",
  "dojo/dom-class",
  "javascript/beltUtils",
  "javascript/boxCards",
  "javascript/conveyorTiles",
  "javascript/gameUtils",
  "javascript/markers",
  "javascript/measurements",
  "javascript/rowTypes",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "sharedJavascript/systemConfigs",
  "dojo/domReady!",
], function (
  dom,
  query,
  domStyle,
  domClass,
  beltUtils,
  boxCards,
  conveyorTiles,
  gameUtils,
  markers,
  measurements,
  rowTypes,
  debugLog,
  genericUtils,
  htmlUtils,
  systemConfigs
) {
  var rowZUIndex = 0;

  // A tile hits two slots.
  // Say first slot is row i, column j.
  // Then the tile is stored in conveyorTileIdsByRowThenColumn[i][j]
  var conveyorTileIdsByRowThenColumn = {};
  var addedConveyorTileIndex = 0;

  // Add a sidebar cell to the row with labels & whatnot.
  function addSidebarCellToRow(rowNode, rowIndex, rowType) {
    var sidebar = htmlUtils.addDiv(rowNode, ["sidebar"], "sidebar");
    domStyle.set(sidebar, {
      width: `${measurements.sidebarWidth}px`,
    });

    var sidebarInfo = rowTypes.getSidebarInfo(rowType);

    var wrapper = htmlUtils.addDiv(sidebar, ["wrapper"], "wrapper");
    htmlUtils.addDiv(wrapper, ["title"], "title", sidebarInfo.title);
    if (sidebarInfo.subtitle) {
      htmlUtils.addDiv(wrapper, ["subtitle"], "subtitle", sidebarInfo.subtitle);
    }
    if (sidebarInfo.instructions) {
      htmlUtils.addDiv(
        wrapper,
        ["instructions"],
        "instructions",
        sidebarInfo.instructions
      );
    }

    return sidebar;
  }

  // Add a single row with one cell with sidebar info.
  // Returns the row.
  function addRowWithSingleSidebarCell(parentNode, rowIndex, rowType) {
    var rowHeight = rowTypes.getRowHeight(rowType);
    var row = gameUtils.addRow(parentNode, [], rowIndex);
    htmlUtils.addStandardBorder(row);

    var finalZIndex = rowZUIndex;
    rowZUIndex--;

    domStyle.set(row, {
      height: `${rowHeight}px`,
      "z-index": `${finalZIndex}`,
    });

    addSidebarCellToRow(row, rowIndex, rowType);

    return row;
  }

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
    // Normally elements are round.
    isSquare: true,
    // Is this circle nth space for a particular thing?
    // E.g. Nth squirrel space.
    entityName: true,
    entityIndex: true,
    // Should we hide the top of the belt (used for top row, we don't want belt above dispensers)
    hideBeltTop: true,
    // Classes to apply to the element.
    classArray: true,
    // Function call to render non-standard element.
    tweakElement: true,
    // Used to not render bottom of belt that normally runs through elements.
    hideBeltBottom: true,
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

    var finalHeight = rowTypes.getRowHeight(rowType);
    var finalZIndex = rowZUIndex;
    rowZUIndex--;

    domStyle.set(row, {
      height: `${finalHeight}px`,
      "z-index": `${finalZIndex}`,
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
      "z-index": `${gameUtils.elementZIndex}`,
      "margin-top": `${measurements.elementTopAndBottomMargin}px`,
      "margin-left": `${measurements.elementLeftAndRightMargin}px`,
    });
  }

  function addStraightBelt(parentNode, elementConfigs) {
    sanityCheckElementConfigs(elementConfigs);
    var hideBeltTop = elementConfigs.hideBeltTop ? true : false;
    var hideBeltBottom = elementConfigs.hideBeltBottom ? true : false;

    var belt = htmlUtils.addDiv(parentNode, ["belt"], "belt");
    domStyle.set(belt, {
      "z-index": `${gameUtils.beltZIndex}`,
    });

    for (let i = 0; i < measurements.beltSegmentsPerRow; i++) {
      if (hideBeltTop && i < measurements.beltSegmentsPerRow / 2) {
        continue;
      }
      if (hideBeltBottom && i >= measurements.beltSegmentsPerRow / 2 - 1) {
        continue;
      }
      var yOffset =
        measurements.beltSegmentOffset / 2 + i * measurements.beltSegmentOffset;
      beltUtils.addBeltSegment(belt, measurements.slotWidth / 2, yOffset);
    }

    return belt;
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
    htmlUtils.addStandardBorder(element);

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
    var isSquare = elementConfigs.isSquare;
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
      if (isSquare) {
        domStyle.set(element, {
          "border-radius": "0px",
        });
      }
    }
    addStraightBelt(standardSlot, elementConfigs);

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
      rowTypes.standardRowHeight / 2 - 2 * gameUtils.boxesRowMarginTop;
    domStyle.set(node, {
      width: `${measurements.smallCardWidth}px`,
      height: `${cardSlotHeight}px`,
      "margin-top": `${gameUtils.boxesRowMarginTop}px`,
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
                hideBeltTop: true,
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
                isSquare: rowType == rowTypes.RowTypes.BoxRobots,
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
                hideBeltBottom: true,
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
    if (sc.demoBoard || maxColumnsPerPage >= totalNumColumns) {
      var pageNode;
      var retVal = addPagesWithNextNColumns(
        bodyNode,
        orderedRowTypes,
        maxRowsPerPage,
        totalNumColumns,
        totalNumColumns,
        0,
        pageNode
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
      var pageNode = allPageNodes[0];

      if (sc.demoBoard) {
        domStyle.set(pageNode, {
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
    // add a marker to this element.
    var elementNode = gameUtils.getElementFromRow(rowNode, columnIndex);
    // add marker here.
    var marker = markers.addMarker(
      elementNode,
      markerType,
      opt_classArray,
      opt_additionalConfig
    );
    fixupMarkerStyling(marker);
    return marker;
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
      "z-index": `${gameUtils.conveyorTileZIndex}`,
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

  function highlightNode(node, color, opt_extra) {
    var variable = opt_extra ? "30px" : "5px";
    domStyle.set(node, {
      "box-shadow": `0 0 ${variable} ${variable} ${color}`,
      "background-color": color,
    });
  }

  function highlightQueryResult(node, queryArg, color) {
    var nodes = query(queryArg, node);
    for (var i = 0; i < nodes.length; i++) {
      var element = nodes[i];
      highlightNode(element, color);
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
        highlightNode(conveyorTile, opt_translucentColor, true);
      } else {
        highlightNode(conveyorTile, color, true);
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
    highlightQueryResult(slot, "#" + elementId, color);
    highlightQueryResult(slot, ".marker", color);
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
    var boxesRowId = gameUtils.getRowId(rowIndex);
    var boxesRow = dom.byId(boxesRowId);
    var element = gameUtils.getElementFromRow(boxesRow, columnIndex);
    // add an oredr card to this element.
    return boxCards.addBoxCardSingleNut(
      element,
      nutType,
      columnIndex,
      opt_classArray
    );
  }

  // This returned object becomes the defined value of this module
  return {
    // Can be used to make a board in sections or a complete board.
    addGameBoard: addGameBoard,

    addMarkerToBoard: addMarkerToBoard,
    addBox: addBox,
    placeConveyorTileOnBoard: placeConveyorTileOnBoard,
    highlightPath: highlightPath,
    highlightQueryResult: highlightQueryResult,
    highlightConveyorTile: highlightConveyorTile,
    getSlotAndHighlightContents: getSlotAndHighlightContents,
    addToken: addToken,
  };
});
