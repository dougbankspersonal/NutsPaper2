define([
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "sharedJavascript/systemConfigs",
  "javascript/beltUtils",
  "javascript/boxHolders",
  "javascript/gameUtils",
  "javascript/machines",
  "javascript/machineTypes",
  "javascript/markers",
  "javascript/measurements",
  "javascript/rowTypes",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  debugLog,
  genericUtils,
  htmlUtils,
  systemConfigs,
  beltUtils,
  boxHolders,
  gameUtils,
  machines,
  machineTypes,
  markers,
  measurements,
  rowTypes
) {
  var rowZUIndex = 20;

  var boxHolderTopMostNutTypeByColumn = [];

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
        case rowTypes.Number:
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
        case rowTypes.Dispenser:
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
        case rowTypes.Conveyor:
        case rowTypes.Path:
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
        case rowTypes.Heart:
        case rowTypes.Skull:
        case rowTypes.Start:
        case rowTypes.End:
        case rowTypes.Salter:
        case rowTypes.Roaster:
        case rowTypes.Squirrel:
        case rowTypes.BoxHolders:
          addNColumnRowWithElements(
            currentPageNode,
            rowIndex,
            rowType,
            numColumnsThisPage,
            numColumnsAlreadyHandled,
            {
              elementConfigs: {
                isRound: rowType == rowTypes.Squirrel,
                beltConfigs: {
                  hideBeltBottom: rowType == rowTypes.BoxHolders,
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

  // This returned object becomes the defined value of this module
  return {
    // Can be used to make a board in sections or a complete board.
    addGameBoard: addGameBoard,
  };
});
