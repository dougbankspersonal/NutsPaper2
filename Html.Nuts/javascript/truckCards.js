define([
  "dojo/dom-style",
  "dojo/dom-class",
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericMeasurements",
  "sharedJavascript/htmlUtils",
  "javascript/iconTypes",
  "javascript/miscTypes",
  "dojo/domReady!",
], function (
  domStyle,
  domClass,
  cards,
  debugLog,
  genericMeasurements,
  htmlUtils,
  iconTypes,
  miscTypes
) {
  //-------------------------------------------------
  //
  // Global vars
  //
  //-------------------------------------------------
  var requirementsHeight = 90;
  var requirementsWidth = 110;
  var requirementsTop = 31;
  var requirementsLeft = 145;
  var requirementPuffMultiple = 1.0;

  function requirementSizeForNutCount(totalNutCount) {
    var layoutByRow = layoutByRowByNumNuts[totalNutCount];
    var numRows = layoutByRow.length;
    var maxNumColumns = 0;
    for (var i = 0; i < numRows; i++) {
      if (layoutByRow[i] > maxNumColumns) {
        maxNumColumns = layoutByRow[i];
      }
    }

    return {
      width:
        requirementPuffMultiple * Math.ceil(requirementsWidth / maxNumColumns),
      height: requirementPuffMultiple * Math.ceil(requirementsHeight / numRows),
    };
  }

  var truckCardConfigs = [
    // Small trucks: Permanent, 3-4
    {
      distribution: {
        [iconTypes.AlmondIcon]: 3,
      },
    },
    {
      distribution: {
        [iconTypes.CashewIcon]: 3,
      },
    },
    {
      distribution: {
        [iconTypes.PeanutIcon]: 3,
      },
    },
    {
      distribution: {
        [iconTypes.PistachioIcon]: 3,
      },
    },
    {
      distribution: {
        [iconTypes.AlmondIcon]: 1,
        [iconTypes.CashewIcon]: 1,
        [iconTypes.PeanutIcon]: 1,
        [iconTypes.PistachioIcon]: 1,
      },
    },

    // Medium trucks: 5 items.
    {
      distribution: {
        [iconTypes.AlmondIcon]: 1,
        [iconTypes.PeanutIcon]: 4,
      },
    },
    {
      distribution: {
        [iconTypes.CashewIcon]: 1,
        [iconTypes.PistachioIcon]: 4,
      },
    },
    {
      distribution: {
        [iconTypes.AlmondIcon]: 3,
        [iconTypes.PistachioIcon]: 2,
      },
    },
    {
      distribution: {
        [iconTypes.CashewIcon]: 3,
        [iconTypes.PeanutIcon]: 2,
      },
    },

    // Big trucks: 7 items.
    {
      distribution: {
        [iconTypes.AlmondIcon]: 2,
        [iconTypes.PistachioIcon]: 5,
      },
    },
    {
      distribution: {
        [iconTypes.CashewIcon]: 2,
        [iconTypes.PeanutIcon]: 5,
      },
    },
    {
      distribution: {
        [iconTypes.AlmondIcon]: 4,
        [iconTypes.CashewIcon]: 3,
      },
    },
    {
      distribution: {
        [iconTypes.PeanutIcon]: 4,
        [iconTypes.PistachioIcon]: 3,
      },
    },
    {
      distribution: {
        [iconTypes.AlmondIcon]: 5,
        [iconTypes.PeanutIcon]: 1,
        [iconTypes.PistachioIcon]: 1,
      },
    },
    {
      distribution: {
        [iconTypes.AlmondIcon]: 1,
        [iconTypes.CashewIcon]: 1,
        [iconTypes.PistachioIcon]: 5,
      },
    },
    {
      distribution: {
        [iconTypes.CashewIcon]: 6,
        [iconTypes.PistachioIcon]: 1,
      },
    },
    {
      distribution: {
        [iconTypes.PeanutIcon]: 6,
        [iconTypes.AlmondIcon]: 1,
      },
    },
  ];
  var numTruckCards = truckCardConfigs.length;
  var boxTilt = 30;

  var layoutByRowByNumNuts = {
    // We only have 3, 4, 5, and 7 right now.
    3: [2, 1],
    4: [2, 2],
    5: [3, 2],
    7: [2, 3, 2],
  };

  //-------------------------------------------------
  //
  // Local helpers
  //
  //-------------------------------------------------
  function factorial(n) {
    if (n == 0) {
      return 1;
    }
    return n * factorial(n - 1);
  }

  function forEachNutIconType(callback) {
    var numNutTypes = iconTypes.orderedNutIconTypes.length;
    for (var i = 0; i < numNutTypes; i++) {
      var iconType = iconTypes.orderedNutIconTypes[i];
      callback(iconType);
    }
  }

  function getTotalNutCount(distribution) {
    var total = 0;
    forEachNutIconType(function (iconType) {
      var countForNut = distribution[iconType] ? distribution[iconType] : 0;
      total += countForNut;
    });
    return total;
  }

  function getLargestCountForAnyOneType(distribution) {
    var largestCount = 0;
    forEachNutIconType(function (iconType) {
      var countForNut = distribution[iconType] ? distribution[iconType] : 0;
      if (countForNut > largestCount) {
        largestCount = countForNut;
      }
    });
    return largestCount;
  }

  function getAverageCountForAnyOneType(distribution) {
    var totalCount = getTotalNutCount(distribution);

    var numContributors = 0;
    forEachNutIconType(function (iconType) {
      var countForNut = distribution[iconType] ? distribution[iconType] : 0;
      if (countForNut > 0) {
        numContributors++;
      }
    });
    return totalCount / numContributors;
  }

  function likelihoodOfDistribution(distribution) {
    debugLog.debugLog(
      "Score",
      "likelihoodOfDistribution: distribution = " + JSON.stringify(distribution)
    );
    var numBoxes = 0;
    var otherFactor = 1;
    forEachNutIconType(function (iconType) {
      var countForNut = distribution[iconType] ? distribution[iconType] : 0;
      numBoxes += countForNut;
      otherFactor = otherFactor * factorial(countForNut);
    });
    debugLog.debugLog(
      "Score",
      "likelihoodOfDistribution: numBoxes = " + numBoxes
    );
    var denominator = iconTypes.orderedNutIconTypes.length ** numBoxes;
    debugLog.debugLog(
      "Score",
      "likelihoodOfDistribution: denominator = " + denominator
    );

    var numerator = factorial(numBoxes) / otherFactor;
    debugLog.debugLog(
      "Score",
      "likelihoodOfDistribution: numerator = " + numerator
    );
    return numerator / denominator;
  }

  function logOfInverseOfLikehoodOfDistribution(distribution) {
    return Math.log(1 / likelihoodOfDistribution(distribution)) / Math.log(2);
  }

  var difficultyScale = 1.7;
  function getDifficultyMultiplier(distribution) {
    var totalNutCount = getTotalNutCount(distribution);
    debugLog.debugLog("Truck", "totalNutCount = " + totalNutCount);
    var retVal = totalNutCount ** difficultyScale;
    debugLog.debugLog("Truck", "retVal = " + retVal);
    return retVal;
  }

  function getCompositionMultiplier(distribution) {
    //				var maxCount = getLargestCountForAnyOneType(distribution)
    var maxCount = getAverageCountForAnyOneType(distribution);
    var totalNutCount = getTotalNutCount(distribution);
    return 1 + maxCount / totalNutCount;
  }

  var finalScale = 10 / 19;
  function chatGptSuggestion(distribution) {
    debugLog.debugLog(
      "Truck",
      "ckat GPT suggestion: distribution = " + distribution
    );
    debugLog.debugLog(
      "Truck",
      "chat GPT suggestion: finalScale = " + finalScale
    );
    debugLog.debugLog(
      "Truck",
      "chat GPT suggestion: getDifficultyMultiplier = " +
        getDifficultyMultiplier(distribution)
    );
    debugLog.debugLog(
      "Truck",
      "chat GPT suggestion: getCompositionMultiplier = " +
        getCompositionMultiplier(distribution)
    );
    return Math.ceil(
      finalScale *
        getDifficultyMultiplier(distribution) *
        getCompositionMultiplier(distribution)
    );
  }

  function triangleNumbersByTypeScore(distribution) {
    var score = 0;
    forEachNutIconType(function (iconType) {
      var countForNut = distribution[iconType] ? distribution[iconType] : 0;
      score += (countForNut * (countForNut + 1)) / 2;
    });
    return score;
  }

  function scoreForDistribution(distribution) {
    // Various heuristics.
    /*
                // Sum triangle numbers for each nut type.
				var score = trianleNumbersByDistribution(distribution)
				*/
    var score = chatGptSuggestion(distribution);

    return score;
  }

  function getNthIconType(distribution, n) {
    var leftover = n;
    for (const iconType in distribution) {
      var countForNut = distribution[iconType];
      if (leftover < countForNut) {
        return iconType;
      }
      leftover -= countForNut;
    }
    // never get here.
    console.assert(
      false,
      "getNthIconType: n = " + n + " not found in distribution"
    );
    return null;
  }

  function addRequirement(parentNode, iconType, requirementSize) {
    var requirementNode = htmlUtils.addDiv(
      parentNode,
      ["requirement"],
      "requirement"
    );

    domStyle.set(requirementNode, {
      width: requirementSize.width + "px",
      height: requirementSize.height + "px",
    });

    var closedBoxNode = htmlUtils.addImage(
      requirementNode,
      [miscTypes.ClosedBox],
      "closedBox"
    );

    htmlUtils.addQuasiRandomTilt(closedBoxNode, -boxTilt, boxTilt);
    htmlUtils.addImage(
      closedBoxNode,
      ["nut_type_icon", iconType, "icon"],
      "nut_type"
    );

    return requirementNode;
  }

  function addTruckDesc(parentNode, truckCardConfig) {
    // Collect n random nut types.
    var distribution = truckCardConfig.distribution;

    // Calculate the score for this distribution
    var score = scoreForDistribution(distribution);

    var wrapper = htmlUtils.addDiv(parentNode, ["wrapper"], "wrapper");

    var innerCardWidth =
      genericMeasurements.cardWidth - 2 * genericMeasurements.cardBorderWidth;
    var innerCardHeight =
      genericMeasurements.cardHeight - 2 * genericMeasurements.cardBorderWidth;
    domStyle.set(wrapper, {
      width: innerCardHeight + "px",
      height: innerCardWidth + "px",
    });

    var truckNode = htmlUtils.addImage(wrapper, ["truck"], "truck");

    var requirementsNode = htmlUtils.addDiv(
      truckNode,
      ["requirements"],
      "requirements"
    );

    domStyle.set(requirementsNode, {
      width: requirementsWidth + "px",
      height: requirementsHeight + "px",
      top: requirementsTop + "px",
      left: requirementsLeft + "px",
    });

    var totalNutCount = getTotalNutCount(distribution);

    // Try to put the nuts in a grid pattern.
    var layoutByRow = layoutByRowByNumNuts[totalNutCount];
    console.assert(
      layoutByRow,
      "layoutByRow is null for totalNutCount = " + totalNutCount
    );
    var numRows = layoutByRow.length;

    var requirementSize = requirementSizeForNutCount(totalNutCount);

    var nutsAdded = 0;
    for (var i = 0; i < numRows; i++) {
      var requirementsRowNode = htmlUtils.addDiv(
        requirementsNode,
        ["requirements_row"],
        "requirementsRow" + i
      );
      domStyle.set(requirementsRowNode, {
        height: 100 / numRows + "%",
      });
      var numNutsInRow = layoutByRow[i];
      for (var j = 0; j < numNutsInRow; j++) {
        var iconType = getNthIconType(distribution, nutsAdded);
        addRequirement(requirementsRowNode, iconType, requirementSize);
        nutsAdded++;
      }
    }

    var scoreNode = htmlUtils.addDiv(wrapper, ["score"], "score");
    scoreNode.innerHTML = score.toString().concat(" points");

    return truckNode;
  }

  function addTruckCard(parent, index) {
    var truckCardConfig = truckCardConfigs[index];
    var idElements = ["truck_card", index.toString()];
    var id = idElements.join(".");
    var classArray = [];
    classArray.push("truck_card");
    var node = cards.addCardFront(parent, classArray, id);

    addTruckDesc(node, truckCardConfig);
    return node;
  }

  function addCardBackWithClass(parent, title, color) {
    var cardBack = cards.addCardBack(parent, title, color);
    domClass.add(cardBack, "truck_card");
  }

  return {
    addTruckCard: addTruckCard,
    numTruckCards: numTruckCards,
    addCardBackWithClass: addCardBackWithClass,
  };
});
