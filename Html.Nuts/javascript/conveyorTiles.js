define([
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/beltUtils",
  "javascript/boardTiles",
  "javascript/measurements",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  debugLog,
  genericUtils,
  htmlUtils,
  beltUtils,
  boardTiles,
  measurements
) {
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
      xOffset: lastX,
      yOffset: lastY,
    });
    // Down a step.
    lastX = lastX;
    lastY = lastY + offsetWhileTurning;
    curvePoints.push({
      xOffset: lastX,
      yOffset: lastY,
    });
    // Down and over a bit, equal measures.
    lastX = lastX + (Math.sqrt(2) * offsetWhileTurning) / 2;
    lastY = lastY + (Math.sqrt(2) * offsetWhileTurning) / 2;
    curvePoints.push({
      xOffset: lastX,
      yOffset: lastY,
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
        xOffset: lastX,
        yOffset: lastY,
      });
    }

    // Now back out...
    var startIndex = curvePoints.length - 1;
    for (let i = startIndex; i--; i >= 0) {
      var oldPoint = curvePoints[i];
      curvePoints.push({
        xOffset: measurements.conveyorTileInnerWidth - oldPoint.xOffset,
        yOffset: endY - oldPoint.yOffset,
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
        var xDelta = nextCurvePoint.xOffset - prevCurvePoint.xOffset;
        var yDelta = nextCurvePoint.yOffset - prevCurvePoint.yOffset;
        thisCurvePoint.rads = Math.PI / 2 + Math.atan2(yDelta, xDelta);
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
    boardTiles.twiddleBoardTile(conveyorTile);
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
    for (let index = 0; index < curvePoints.length; index++) {
      var curvePoint = curvePoints[index];
      configs.rads = -curvePoint.rads;
      beltUtils.addBeltSegment(
        belt,
        measurements.conveyorTileInnerWidth - curvePoint.xOffset,
        curvePoint.yOffset,
        configs
      );
      configs.zIndex--;
    }
    return belt;
  }

  function addLeftToRightBelt(conveyorTile) {
    var belt = htmlUtils.addDiv(conveyorTile, ["belt", "left"], "leftBelt");
    var zIndex = curvePoints.length + 1;
    var configs = {
      zIndex: zIndex,
    };
    for (let index = 0; index < curvePoints.length; index++) {
      var curvePoint = curvePoints[index];
      configs.rads = curvePoint.rads;
      beltUtils.addBeltSegment(
        belt,
        curvePoint.xOffset,
        curvePoint.yOffset,
        configs
      );
      configs.zIndex--;
    }
    return belt;
  }

  function addSplitterJoinerTile(
    parentNode,
    conveyorTileId,
    arity,
    opt_classArray
  ) {
    debugLog.debugLog(
      "ConveyorTiles",
      "Doug: addSplitterJoinerTile arity == " + arity
    );
    var conveyorTile = addEmptyConveyorTileElement(
      parentNode,
      conveyorTileId,
      opt_classArray
    );

    // Add belts.
    if (arity) {
      // Left to right belt.
      addLeftToRightBelt(conveyorTile);
      // Left to left belt.
      var xOffset = measurements.beltCenterOffsetInConveyorTile;
      beltUtils.addStraightBelt(conveyorTile, {
        xOffset: xOffset,
      });
    } else {
      // Right to left belt.
      var xOffset =
        measurements.conveyorTileInnerWidth -
        measurements.beltCenterOffsetInConveyorTile;
      addRightToLeftBelt(conveyorTile);
      beltUtils.addStraightBelt(conveyorTile, {
        xOffset: xOffset,
      });
    }

    return conveyorTile;
  }

  function addCrossTile(parentNode, conveyorTileId, opt_classArray) {
    var conveyorTile = addEmptyConveyorTileElement(
      parentNode,
      conveyorTileId,
      opt_classArray
    );

    // Add belts.
    // Left to right belt.
    addLeftToRightBelt(conveyorTile);

    // Right to left belt.
    addRightToLeftBelt(conveyorTile);

    return conveyorTile;
  }

  function addConveyorTilesPage(
    bodyNode,
    numConveyorTiles,
    opt_isSplitterJoiner
  ) {
    var pageNode = htmlUtils.addPageOfItems(bodyNode);

    for (let i = 0; i < numConveyorTiles; i++) {
      var tileId = "tileId" + i;
      if (opt_isSplitterJoiner) {
        addSplitterJoinerTile(pageNode, tileId, i % 2 == 0);
      } else {
        addCrossTile(pageNode, tileId);
      }
    }

    return pageNode;
  }

  function createConveyorTiles(totalNumTiles, opt_isSplitterJoiner) {
    var bodyNode = dom.byId("body");
    var stripsPerPage = 12;
    var numPages = Math.ceil(totalNumTiles / stripsPerPage);
    for (i = 0; i < numPages; i++) {
      var numStripsThisPage = Math.min(
        stripsPerPage,
        totalNumTiles - i * stripsPerPage
      );
      addConveyorTilesPage(bodyNode, numStripsThisPage, opt_isSplitterJoiner);
    }
  }

  // This returned object becomes the defined value of this module
  return {
    createConveyorTiles: createConveyorTiles,
    addCrossTile: addCrossTile,
    addSplitterJoinerTile: addSplitterJoinerTile,
  };
});
