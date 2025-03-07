define([
  "javascript/nutTypes",
  "sharedJavascript/cards",
  "sharedJavascript/genericMeasurements",
  "sharedJavascript/htmlUtils",
  "dojo/dom-style",
  "dojo/domReady!",
], function (nutTypes, cards, genericMeasurements, htmlUtils, domStyle) {
  //-------------------------------------------------
  //
  // Global vars
  //
  //-------------------------------------------------
  var truckCardConfigs = [
    // Small trucks: Permanent, 3-4
    {
      distribution: {
        Almond: 3,
      },
    },
    {
      distribution: {
        Cashew: 3,
      },
    },
    {
      distribution: {
        Peanut: 3,
      },
    },
    {
      distribution: {
        Pistachio: 3,
      },
    },
    {
      distribution: {
        Almond: 1,
        Cashew: 1,
        Peanut: 1,
        Pistachio: 1,
      },
    },

    // Medium trucks: 5 items.
    {
      distribution: {
        Almond: 1,
        Peanut: 4,
      },
    },
    {
      distribution: {
        Cashew: 1,
        Pistachio: 4,
      },
    },
    {
      distribution: {
        Almond: 3,
        Pistachio: 2,
      },
    },
    {
      distribution: {
        Cashew: 3,
        Peanut: 2,
      },
    },

    // Big trucks: 7 items.
    {
      distribution: {
        Almond: 2,
        Pistachio: 5,
      },
    },
    {
      distribution: {
        Cashew: 2,
        Peanut: 5,
      },
    },
    {
      distribution: {
        Almond: 4,
        Cashew: 3,
      },
    },
    {
      distribution: {
        Peanut: 4,
        Pistachio: 3,
      },
    },
    {
      distribution: {
        Almond: 5,
        Peanut: 1,
        Pistachio: 1,
      },
    },
    {
      distribution: {
        Almond: 1,
        Cashew: 1,
        Pistachio: 5,
      },
    },
    {
      distribution: {
        Cashew: 6,
        Pistachio: 1,
      },
    },
    {
      distribution: {
        Peanut: 6,
        Almond: 1,
      },
    },
  ];
  var numTruckCards = truckCardConfigs.length;

  var closedBoxSize = 55;
  var nutTypeSize = closedBoxSize * 0.8;
  var boxTilt = 10;

  var permanentStarSize = 40;

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

  function getTotalNutCount(distribution) {
    var total = 0;
    for (var i = 0; i < nutTypes.numNutTypes; i++) {
      var nutType = nutTypes.nutTypes[i];
      var countForNut = distribution[nutType] ? distribution[nutType] : 0;
      total += countForNut;
    }
    return total;
  }

  function getLargestCountForAnyOneType(distribution) {
    var largestCount = 0;
    for (var i = 0; i < nutTypes.numNutTypes; i++) {
      var nutType = nutTypes.nutTypes[i];
      var countForNut = distribution[nutType] ? distribution[nutType] : 0;
      if (countForNut > largestCount) {
        largestCount = countForNut;
      }
    }
    return largestCount;
  }

  function getAverageCountForAnyOneType(distribution) {
    var totalCount = getTotalNutCount(distribution);

    var numContributors = 0;
    for (var i = 0; i < nutTypes.numNutTypes; i++) {
      var nutType = nutTypes.nutTypes[i];
      var countForNut = distribution[nutType] ? distribution[nutType] : 0;
      if (countForNut > 0) {
        numContributors++;
      }
    }
    return totalCount / numContributors;
  }

  function likelihoodOfDistribution(distribution) {
    debugLog.debugLog(
      "Score",
      "likelihoodOfDistribution: distribution = " + JSON.stringify(distribution)
    );
    var numBoxes = 0;
    var otherFactor = 1;
    for (var i = 0; i < nutTypes.numNutTypes; i++) {
      var nutType = nutTypes.nutTypes[i];
      var countForNut = distribution[nutType] ? distribution[nutType] : 0;
      numBoxes += countForNut;
      otherFactor = otherFactor * factorial(countForNut);
    }
    debugLog.debugLog(
      "Score",
      "likelihoodOfDistribution: numBoxes = " + numBoxes
    );
    var denominator = nutTypes.numNutTypes ** numBoxes;
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
    return totalNutCount ** difficultyScale;
  }

  function getCompositionMultiplier(distribution) {
    //				var maxCount = getLargestCountForAnyOneType(distribution)
    var maxCount = getAverageCountForAnyOneType(distribution);
    var totalNutCount = getTotalNutCount(distribution);
    return 1 + maxCount / totalNutCount;
  }

  var finalScale = 10 / 19;
  function chatGptSuggestion(distribution) {
    return Math.ceil(
      finalScale *
        getDifficultyMultiplier(distribution) *
        getCompositionMultiplier(distribution)
    );
  }

  function triangleNumbersByTypeScore(distribution) {
    var score = 0;
    for (var i = 0; i < nutTypes.numNutTypes; i++) {
      var nutType = nutTypes.nutTypes[i];
      var countForNut = distribution[nutType] ? distribution[nutType] : 0;
      score += (countForNut * (countForNut + 1)) / 2;
    }
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

  function addTruckDesc(parentNode, truckCardConfig) {
    // Collect n random nut types.
    var nutTypeDistribution = truckCardConfig.distribution;

    // Calculate the score for this distribution
    var score = scoreForDistribution(nutTypeDistribution);

    var wrapper = htmlUtils.addDiv(parentNode, ["wrapper"], "wrapper");

    var innerCardWidth =
      genericMeasurements.cardWidth - 2 * genericMeasurements.cardBorderWidth;
    var innerCardHeight =
      genericMeasurements.cardHeight - 2 * genericMeasurements.cardBorderWidth;
    domStyle.set(wrapper, {
      width: innerCardHeight + "px",
      height: innerCardWidth + "px",
    });

    var truckScale = 0.8;
    var truckWidth = innerCardHeight * truckScale;
    var truckHeight = innerCardWidth * truckScale;
    var truckNode = htmlUtils.addImage(wrapper, ["truck"], "truck");
    domStyle.set(truckNode, {
      width: truckWidth + "px",
      height: truckHeight + "px",
    });

    var requirementsNode = htmlUtils.addDiv(
      truckNode,
      ["requirements"],
      "requirements"
    );
    domStyle.set(requirementsNode, {
      width: "100%",
      height: "90%",
    });

    for (var i = 0; i < nutTypes.numNutTypes; i++) {
      var nutType = nutTypes.nutTypes[i];
      var typeCount = nutTypeDistribution[nutType];
      for (var j = 0; j < typeCount; j++) {
        var requirement = htmlUtils.addDiv(
          requirementsNode,
          ["requirement"],
          "requirement"
        );
        var closedBoxNode = htmlUtils.addImage(
          requirement,
          ["closedBox"],
          "closedBox"
        );
        domStyle.set(closedBoxNode, {
          width: closedBoxSize + "px",
          height: closedBoxSize + "px",
        });
        htmlUtils.addQuasiRandomTilt(closedBoxNode, -boxTilt, boxTilt);

        var nutTypeNode = htmlUtils.addImage(
          closedBoxNode,
          ["nut_type", nutType],
          "nut_type"
        );
        domStyle.set(nutTypeNode, {
          width: nutTypeSize + "px",
          height: nutTypeSize + "px",
        });
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

  return {
    addTruckCard: addTruckCard,
    numTruckCards: numTruckCards,
  };
});
