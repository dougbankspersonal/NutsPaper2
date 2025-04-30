define([
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/htmlUtils",
  "javascript/gameUtils",
  "javascript/nutTypes",
  "dojo/domReady!",
], function (domStyle, debugLog, htmlUtils, gameUtils, nutTypes) {
  var numRows = 10;
  var numColumns = 10;
  var titleRowHeight = 80;
  var cellBorder = 3;
  var cellInnerWidth = 50;
  var cellInnerHeight = cellInnerWidth;
  var cellWidth = cellInnerWidth + 2 * cellBorder;
  var cellHeight = cellInnerHeight + 2 * cellBorder;
  var normalRowHeight = cellHeight;
  var normalRowMargin = 10;
  var cellSideMargin = normalRowMargin / 2;
  var totalHeight =
    titleRowHeight + numRows * normalRowHeight + numRows * normalRowMargin;
  var totalWidth = numColumns * (cellWidth + cellSideMargin * 2);

  function addMainDiv(parentNode) {
    var mainDiv = htmlUtils.addDiv(parentNode, ["main_div"], "mainDiv", "");
    domStyle.set(mainDiv, {
      height: totalHeight + "px",
      width: totalWidth + "px",
    });
    return mainDiv;
  }

  function addTitle(parentNode) {
    var titleRow = gameUtils.addRow(
      parentNode,
      ["scoring_row", "title_row"],
      0
    );
    domStyle.set(titleRow, {
      width: "100%",
      height: titleRowHeight + "px",
    });

    var titleText = htmlUtils.addDiv(
      titleRow,
      ["title_text"],
      "titleText",
      "Scoring Track"
    );
    domStyle.set(titleText, {
      width: "100%",
      height: "100%",
      "line-height": titleRowHeight + "px",
    });
  }

  function addNthRow(parentNode, rowIndex) {
    var nthRowNode = gameUtils.addRow(
      parentNode,
      ["scoring_row"],
      "scoringRow" + rowIndex
    );
    debugLog.debugLog("ScoringTrack", "Doug: addNthRow rowIndex = " + rowIndex);
    debugLog.debugLog(
      "ScoringTrack",
      "Doug: addNthRow nthRowNode = " + nthRowNode
    );

    domStyle.set(nthRowNode, {
      width: "100%",
      height: normalRowHeight + "px",
      "margin-top": normalRowMargin + "px",
      "justify-content": "center",
    });
    for (j = 0; j < numColumns; j++) {
      var cellIndex = rowIndex * 10 + j;

      var nutTypeIndex = cellIndex % nutTypes.orderedNutTypes.length;
      var nutType = nutTypes.orderedNutTypes[nutTypeIndex];

      var cellContainerNode = htmlUtils.addDiv(
        nthRowNode,
        ["cell_container"],
        "cellContainer" + cellIndex
      );
      domStyle.set(cellContainerNode, {
        width: cellInnerWidth + "px",
        height: cellInnerHeight + "px",
        "margin-left": cellSideMargin + "px",
        "margin-right": cellSideMargin + "px",
      });

      var cellImageNode = htmlUtils.addImage(
        cellContainerNode,
        ["cell_image", nutType],
        "cellImage" + cellIndex
      );
      htmlUtils.addQuasiRandomTilt(cellImageNode, -20, 20);

      var cellTextNode = htmlUtils.addDiv(
        cellContainerNode,
        ["cell_text"],
        "cellText" + cellIndex,
        cellIndex.toString()
      );
      domStyle.set(cellTextNode, {
        "font-size": "20px",
        "text-align": "center",
        "line-height": cellInnerHeight + "px",
      });
    }

    debugLog.debugLog(
      "ScoringTrack",
      "Doug: addNthRow returnung nthRowNode = " + nthRowNode
    );
    return nthRowNode;
  }

  function makeScoringTrack(dom) {
    debugLog.debugLog("ScoringTrack", "Doug: makeScoringTrack");

    // Make the body node.
    var bodyNode = dom.byId("body");

    debugLog.debugLog("ScoringTrack", "Doug: in main");
    var pageNode = htmlUtils.addPageOfItems(bodyNode);

    var mainDiv = addMainDiv(pageNode);

    addTitle(mainDiv);

    debugLog.debugLog("ScoringTrack", "numRows = " + numRows);
    for (i = 0; i < numRows; i++) {
      debugLog.debugLog("ScoringTrack", "Doug: in loop i = " + i);
      addNthRow(mainDiv, i);
    }
  }

  return {
    makeScoringTrack: makeScoringTrack,
  };
});
