define([
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/beltUtils",
  "javascript/measurements",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  debugLog,
  genericUtils,
  htmlUtils,
  beltUtils,
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

  function addConveyorTile(
    parentNode,
    conveyorTileId,
    conveyorTileType,
    opt_classArray
  ) {
    var conveyorTile = addEmptyConveyorTileElement(
      parentNode,
      conveyorTileId,
      opt_classArray
    );

    // Add belts.
    // "right" belt: moves from top right to bottom left: /
    // Present in cross X, JoinerLefr |/, SplitterLeft /|
    if (
      conveyorTileType == "Cross" ||
      conveyorTileType == "JoinerLeft" ||
      conveyorTileType == "SplitterLeft"
    ) {
      addRightToLeftBelt(conveyorTile);
    }

    // "left" belt: moves from top left to bottom right: \
    // Present in cross X, JoinerRight \|, SplitterRight |\
    if (
      conveyorTileType == "Cross" ||
      conveyorTileType == "JoinerRight" ||
      conveyorTileType == "SplitterRight"
    ) {
      addLeftToRightBelt(conveyorTile);
    }

    // right-side straight belt: top right to bottom right.
    // Present in JoinerRight and SplitterLeft.
    if (
      conveyorTileType == "JoinerRight" ||
      conveyorTileType == "SplitterLeft"
    ) {
      addLeftToRightBelt(conveyorTile);
    }

    // Add cro
    return conveyorTile;
  }

  function addConveyorTilesPage(bodyNode, numConveyorTiles, conveyorTileType) {
    var pageNode = htmlUtils.addPageOfItems(bodyNode);

    for (let i = 0; i < numConveyorTiles; i++) {
      var tileId = "tileId" + i;
      addConveyorTile(pageNode, tileId, conveyorTileType);
    }

    return pageNode;
  }

  function createConveyorTiles(totalNumTiles, conveyorTileType) {
    var bodyNode = dom.byId("body");
    var stripsPerPage = 12;
    var numPages = Math.ceil(totalNumTiles / stripsPerPage);
    for (i = 0; i < numPages; i++) {
      var numStripsThisPage = Math.min(
        stripsPerPage,
        totalNumTiles - i * stripsPerPage
      );
      addConveyorTilesPage(bodyNode, numStripsThisPage, conveyorTileType);
    }
  }

  // This returned object becomes the defined value of this module
  return {
    createConveyorTiles: createConveyorTiles,
    addCrossTile: addCrossTile,
    addSplitterJoinerTile: addSplitterJoinerTile,
  };
});
