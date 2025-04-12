define([
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/measurements",
  "dojo/domReady!",
], function (domStyle, debugLog, genericUtils, htmlUtils, measurements) {
  function addBeltSegment(parentNode, xOffset, yOffset, opt_options) {
    var options = opt_options ? opt_options : {};
    var beltSegment = htmlUtils.addDiv(
      parentNode,
      ["beltSegment"],
      "beltSegment"
    );

    var zIndex;
    if (options.zIndex) {
      zIndex = options.zIndex;
    } else {
      zIndex = measurements.beltSegmentGlobalZIndex;
      measurements.beltSegmentGlobalZIndex--;
    }
    var style = {
      left: `${xOffset}px`,
      top: `${yOffset}px`,
      "z-index": zIndex,
      height: `${measurements.beltSegmentHeight}px`,
      width: `${measurements.beltSegmentWidth}px`,
    };
    if (options.rads != null) {
      style["transform"] = `translate(-50%, -50%	) rotate(${options.rads}rad)`;
    }

    domStyle.set(beltSegment, style);
    return beltSegment;
  }

  var validBeltConfigKeys = {
    // Should we hide the top of the belt (used for top row, we don't want belt above dispensers)
    hideBeltTop: true,
    // Should we hide the bottom of the belt (used for bottom row, we don't want belt below box holders)
    hideBeltBottom: true,
    // On big game board we want tiles to overlap row to row -> we need a global z-index.
    // On an individual tile we don't want/need that.
    useLocalZIndex: true,
    xOffset: true,
  };

  function sanityCheckBeltConfigs(beltConfigs) {
    genericUtils.sanityCheckTable(beltConfigs, validBeltConfigKeys);
  }

  function addStraightBelt(conveyorTile, isLeft) {
    var belt = htmlUtils.addDiv(
      conveyorTile,
      ["belt", isLeft ? "left" : "right"],
      isLeft ? "leftBelt" : "rightBelt"
    );
    var xOffset = isLeft
      ? measurements.beltCenterOffsetInConveyorTile
      : measurements.conveyorTileInnerWidth -
        measurements.beltCenterOffsetInConveyorTile;
    var zIndex = measurements.beltSegmentsPerRow + 1;
    var configs = {
      zIndex: zIndex,
    };
    for (let i = 0; i < measurements.beltSegmentsPerRow; i++) {
      var yOffset =
        measurements.beltSegmentOffset / 2 + i * measurements.beltSegmentOffset;
      beltUtils.addBeltSegment(belt, xOffset, yOffset, configs);
      configs.zIndex--;
    }
  }

  function addStraightBelt(parentNode, opt_beltConfigs) {
    var beltConfigs = opt_beltConfigs ? opt_beltConfigs : {};
    sanityCheckBeltConfigs(beltConfigs);

    debugLog.debugLog("Belts", "addStraightBelt: beltConfigs = ", beltConfigs);

    var hideBeltTop = beltConfigs.hideBeltTop ? true : false;
    var hideBeltBottom = beltConfigs.hideBeltBottom ? true : false;
    var xOffset = beltConfigs.xOffset
      ? beltConfigs.xOffset
      : measurements.slotWidth / 2;

    var belt = htmlUtils.addDiv(parentNode, ["belt", "straight"], "belt");
    domStyle.set(belt, {
      "z-index": `${measurements.beltZIndex}`,
      left: `${xOffset}px`,
    });
    domStyle.set(belt, {
      width: `${measurements.beltSegmentWidth}px`,
    });

    var options = {};
    if (beltConfigs.useLocalZIndex) {
      options.zIndex = measurements.beltSegmentsPerRow + 1;
    }

    for (let i = 0; i < measurements.beltSegmentsPerRow; i++) {
      if (hideBeltTop && i < measurements.beltSegmentsPerRow / 2) {
        continue;
      }
      if (hideBeltBottom && i >= measurements.beltSegmentsPerRow / 2 - 1) {
        continue;
      }
      var yOffset =
        measurements.beltSegmentOffset / 2 + i * measurements.beltSegmentOffset;
      addBeltSegment(belt, 0, yOffset, options);
      if (beltConfigs.useLocalZIndex) {
        options.zIndex--;
      }
    }

    return belt;
  }

  // This returned object becomes the defined value of this module
  return {
    addBeltSegment: addBeltSegment,
    addStraightBelt: addStraightBelt,
  };
});
