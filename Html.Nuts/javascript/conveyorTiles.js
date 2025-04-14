define([
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/beltUtils",
  "javascript/conveyorTileTypes",
  "javascript/measurements",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  debugLog,
  genericUtils,
  htmlUtils,
  beltUtils,
  conveyorTileTypes,
  measurements
) {
  // One set of curve points for an belt that crossees.
  // This one cross top left to bottom right.
  function getCurvePoints() {
    var curvePoints = [];

    var startX = measurements.beltCenterOffsetInConveyorTile;
    var endX =
      measurements.conveyorTileInnerWidth -
      measurements.beltCenterOffsetInConveyorTile;

    var startY = 0;
    var endY = measurements.conveyorTileHeight;
    var middleX = (startX + endX) / 2;
    var middleY = (startY + endY) / 2;

    var offsetWhileTurning = measurements.beltSegmentHeight / 2;

    var lastX = startX;
    var lastY = startY;
    curvePoints.push({
      leftPx: lastX,
      topPx: lastY,
    });
    // Down a step.
    lastX = lastX;
    lastY = lastY + offsetWhileTurning;
    curvePoints.push({
      leftPx: lastX,
      topPx: lastY,
    });
    // Down and over a bit, equal measures.
    lastX = lastX + (Math.sqrt(2) * offsetWhileTurning) / 2;
    lastY = lastY + (Math.sqrt(2) * offsetWhileTurning) / 2;
    curvePoints.push({
      leftPx: lastX,
      topPx: lastY,
    });

    // Now over to the middle.
    var distanceToMiddle = Math.sqrt(
      (lastX - middleX) ** 2 + (lastY - middleY) ** 2
    );
    var numSegments = Math.ceil(
      distanceToMiddle / measurements.beltSegmentHeight
    );
    var xDelta = (middleX - lastX) / numSegments;
    var yDelta = (middleY - lastY) / numSegments;
    for (let i = 0; i < numSegments; i++) {
      lastX = lastX + xDelta;
      lastY = lastY + yDelta;
      curvePoints.push({
        leftPx: lastX,
        topPx: lastY,
      });
    }

    // Now back out...
    var startIndex = curvePoints.length - 1;
    for (let i = startIndex; i--; i >= 0) {
      var oldPoint = curvePoints[i];
      curvePoints.push({
        leftPx: measurements.conveyorTileInnerWidth - oldPoint.leftPx,
        topPx: endY - oldPoint.topPx,
      });
    }

    // Throw in angles.
    for (let index = 0; index < curvePoints.length; index++) {
      var prevCurvePoint = null;
      var nextCurvePoint = null;
      var thisCurvePoint = curvePoints[index];
      if (index > 0) {
        prevCurvePoint = curvePoints[index - 1];
      }

      if (index < curvePoints.length - 1) {
        nextCurvePoint = curvePoints[index + 1];
      }

      thisCurvePoint.rads = 0;
      if (prevCurvePoint != null && nextCurvePoint != null) {
        var xDelta = nextCurvePoint.leftPx - prevCurvePoint.leftPx;
        var yDelta = nextCurvePoint.topPx - prevCurvePoint.topPx;
        thisCurvePoint.rads = Math.atan2(xDelta, yDelta);
      }
    }

    return curvePoints;
  }

  var curvePoints = getCurvePoints();

  function addEmptyConveyorTileElement(
    parentNode,
    conveyorTileId,
    opt_classArray
  ) {
    var classArray = genericUtils.growOptStringArray(opt_classArray, [
      "conveyor_tile",
      "board_tile",
    ]);
    var conveyorTile = htmlUtils.addDiv(parentNode, classArray, conveyorTileId);
    domStyle.set(conveyorTile, {
      width: `${measurements.conveyorTileWidth}px`,
      height: `${measurements.conveyorTileHeight}px`,
      border: `${measurements.conveyorTileBorder}px solid #000000`,
    });
    return conveyorTile;
  }

  function addRightToLeftBelt(conveyorTile) {
    belt = htmlUtils.addDiv(conveyorTile, ["belt", , "right"], "rightBelt");
    var zIndex = curvePoints.length + 1;
    var configs = {
      zIndex: zIndex,
    };

    debugLog.debugLog(
      "Belts",
      "Doug: addRightToLeftBelt: curvePoints = " + JSON.stringify(curvePoints)
    );
    for (let index = 0; index < curvePoints.length; index++) {
      // The original curve points decribe both left and top incresaing -> it's a dialogonal life from
      // upper left to lower right.
      // We are doing opposite, upper right to lower left.
      // So we do some tweaking: x gets smaller as y gets higher,  So we are startingn upper
      // right and going down and to the left.
      //
      var curvePoint = curvePoints[index];
      configs.rads = curvePoint.rads;

      beltUtils.addBeltSegment(
        belt,
        measurements.conveyorTileInnerWidth - curvePoint.leftPx,
        curvePoint.topPx,
        configs
      );
      configs.zIndex--;
    }
    return belt;
  }

  function addLeftToRightBelt(conveyorTile) {
    var belt = htmlUtils.addDiv(
      conveyorTile,
      ["belt", "left"],
      "leftToRightBelt"
    );
    var zIndex = curvePoints.length + 1;
    var configs = {
      zIndex: zIndex,
    };
    for (let index = 0; index < curvePoints.length; index++) {
      var curvePoint = curvePoints[index];
      configs.rads = -curvePoint.rads;
      debugLog.debugLog("Belts", "Doug: addLeftToRightBelt: index  = " + index);
      debugLog.debugLog(
        "Belts",
        "Doug: addLeftToRightBelt: configs.rads  = " + configs.rads
      );
      beltUtils.addBeltSegment(
        belt,
        curvePoint.leftPx,
        curvePoint.topPx,
        configs
      );
      configs.zIndex--;
    }
    return belt;
  }

  function addConveyorTile(
    parentNode,
    tileId,
    conveyorTileType,
    opt_classArray
  ) {
    debugLog.debugLog("ConveyorTiles", "addConveyorTile: tileId = " + tileId);
    debugLog.debugLog(
      "ConveyorTiles",
      "addConveyorTile: conveyorTileType = " + conveyorTileType
    );
    debugLog.debugLog(
      "ConveyorTiles",
      "addConveyorTile: opt_classArray = " + JSON.stringify(opt_classArray)
    );
    var conveyorTile = addEmptyConveyorTileElement(
      parentNode,
      tileId,
      opt_classArray
    );

    // Add belts.
    // Look at conveyorTileTypes pictures:
    //
    if (
      conveyorTileType == conveyorTileTypes.Cross ||
      conveyorTileType == conveyorTileTypes.JoinerLeft ||
      conveyorTileType == conveyorTileTypes.SplitterRight
    ) {
      debugLog.debugLog(
        "ConveyorTiles",
        "addConveyorTile: addRightToLeftBelt."
      );
      addRightToLeftBelt(conveyorTile);
    }

    // "left" belt: moves from top left to bottom right: \
    // Present in cross X, JoinerRight \|, SplitterRight |\
    if (
      conveyorTileType == conveyorTileTypes.Cross ||
      conveyorTileType == conveyorTileTypes.JoinerRight ||
      conveyorTileType == conveyorTileTypes.SplitterLeft
    ) {
      debugLog.debugLog(
        "ConveyorTiles",
        "addConveyorTile: addLeftToRightBelt."
      );
      addLeftToRightBelt(conveyorTile);
    }

    // right-side straight belt: top right to bottom right.
    // Present in JoinerRight and SplitterLeft.
    if (
      conveyorTileType == "JoinerRight" ||
      conveyorTileType == "SplitterRight"
    ) {
      debugLog.debugLog("ConveyorTiles", "addConveyorTile: addStraightBelt.");
      // Right to Right belt.
      var leftPx =
        measurements.conveyorTileInnerWidth -
        measurements.beltCenterOffsetInConveyorTile;
      beltUtils.addStraightBelt(conveyorTile, {
        isLeft: false,
        leftPx: leftPx,
      });
    }

    // left-side straight belt: top left to bottom left.
    // Present in JoinerLeft and SplitterRight.
    if (
      conveyorTileType == "JoinerLeft" ||
      conveyorTileType == "SplitterLeft"
    ) {
      // Left to Left belt.
      var leftPx = measurements.beltCenterOffsetInConveyorTile;
      beltUtils.addStraightBelt(conveyorTile, {
        isLeft: true,
        leftPx: leftPx,
      });
    }

    return conveyorTile;
  }

  function addConveyorTilesPage(bodyNode, conveyorTileType, numConveyorTiles) {
    var pageNode = htmlUtils.addPageOfItems(bodyNode);

    for (let i = 0; i < numConveyorTiles; i++) {
      var tileId = "tileId" + i;
      addConveyorTile(pageNode, tileId, conveyorTileType);
    }

    return pageNode;
  }

  function createConveyorTiles(conveyorTileType, totalNumTiles) {
    var bodyNode = dom.byId("body");
    var stripsPerPage = 12;
    var numPages = Math.ceil(totalNumTiles / stripsPerPage);
    for (i = 0; i < numPages; i++) {
      var numStripsThisPage = Math.min(
        stripsPerPage,
        totalNumTiles - i * stripsPerPage
      );
      addConveyorTilesPage(bodyNode, conveyorTileType, numStripsThisPage);
    }
  }

  // This returned object becomes the defined value of this module
  return {
    // Add just pone CT inside somme existing div.
    addConveyorTile: addConveyorTile,
    // Make a whole page pf all ct CVs.
    createConveyorTiles: createConveyorTiles,
  };
});
