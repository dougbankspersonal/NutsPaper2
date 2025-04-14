define([
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/measurements",
  "dojo/domReady!",
], function (domStyle, debugLog, genericUtils, htmlUtils, measurements) {
  function addBeltSegment(parentNode, leftPx, topPx, opt_options) {
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
      left: `${leftPx}px`,
      top: `${topPx}px`,
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

  var validStraightBeltConfigKeys = {
    // Should we hide the top of the belt (used for top row, we don't want belt above dispensers)
    hideBeltTop: true,
    // Should we hide the bottom of the belt (used for bottom row, we don't want belt below box holders)
    hideBeltBottom: true,
    // On big game board we want tiles to overlap row to row -> we need a global z-index.
    // On an individual tile we don't want/need that.
    useLocalZIndex: true,
    leftPx: true,
    isLeft: true,
  };

  function sanityCheckStraightBeltConfigs(straightBeltConfigs) {
    genericUtils.sanityCheckTable(
      straightBeltConfigs,
      validStraightBeltConfigKeys
    );
  }

  function addStraightBelt(parentNode, opt_straightBeltConfigs) {
    var straightBeltConfigs = opt_straightBeltConfigs
      ? opt_straightBeltConfigs
      : {};
    sanityCheckStraightBeltConfigs(straightBeltConfigs);

    debugLog.debugLog(
      "Belts",
      "addStraightBelt: beltConfigs = ",
      straightBeltConfigs
    );

    var hideBeltTop = straightBeltConfigs.hideBeltTop ? true : false;
    var hideBeltBottom = straightBeltConfigs.hideBeltBottom ? true : false;
    var leftPx = straightBeltConfigs.leftPx
      ? straightBeltConfigs.leftPx
      : measurements.slotWidth / 2;

    var classArray = ["belt", "straight"];
    if (straightBeltConfigs.isLeft) {
      classArray.push("leftStraight");
    } else {
      classArray.push("rightStraight");
    }

    var belt = htmlUtils.addDiv(parentNode, classArray, "belt");
    domStyle.set(belt, {
      "z-index": `${measurements.beltZIndex}`,
      left: `${leftPx}px`,
    });
    domStyle.set(belt, {
      width: `${measurements.beltSegmentWidth}px`,
    });

    var options = {};
    if (straightBeltConfigs.useLocalZIndex) {
      options.zIndex = measurements.beltSegmentsPerRow + 1;
    }

    for (let i = 0; i < measurements.beltSegmentsPerRow; i++) {
      if (hideBeltTop && i < measurements.beltSegmentsPerRow / 2) {
        continue;
      }
      if (hideBeltBottom && i >= measurements.beltSegmentsPerRow / 2 - 1) {
        continue;
      }
      var topPx =
        measurements.beltSegmentOffset / 2 + i * measurements.beltSegmentOffset;
      addBeltSegment(belt, 0, topPx, options);
      if (straightBeltConfigs.useLocalZIndex) {
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
