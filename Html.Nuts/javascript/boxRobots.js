define([
  "dojo/dom-style",
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/boardTiles",
  "javascript/iconTypes",
  "javascript/miscTypes",
  "javascript/nutTypes",
  "dojo/domReady!",
], function (
  domStyle,
  cards,
  debugLog,
  genericUtils,
  htmlUtils,
  boardTiles,
  iconTypes,
  miscTypes
) {
  var boxRobotCardConfigs = [
    {
      orderOfNuts: [
        iconTypes.AlmondIcon,
        iconTypes.CashewIcon,
        iconTypes.PeanutIcon,
        iconTypes.PistachioIcon,
      ],
    },
    {
      orderOfNuts: [
        iconTypes.AlmondIcon,
        iconTypes.CashewIcon,
        iconTypes.PistachioIcon,
        iconTypes.PeanutIcon,
      ],
    },
    {
      orderOfNuts: [
        iconTypes.AlmondIcon,
        iconTypes.PeanutIcon,
        iconTypes.CashewIcon,
        iconTypes.PistachioIcon,
      ],
    },
    {
      orderOfNuts: [
        iconTypes.AlmondIcon,
        iconTypes.PeanutIcon,
        iconTypes.PistachioIcon,
        iconTypes.CashewIcon,
      ],
    },
    {
      orderOfNuts: [
        iconTypes.AlmondIcon,
        iconTypes.PistachioIcon,
        iconTypes.CashewIcon,
        iconTypes.PeanutIcon,
      ],
    },
    {
      orderOfNuts: [
        iconTypes.AlmondIcon,
        iconTypes.PistachioIcon,
        iconTypes.PeanutIcon,
        iconTypes.CashewIcon,
      ],
    },
    {
      orderOfNuts: [
        iconTypes.AlmondIcon,
        iconTypes.CashewIcon,
        iconTypes.PeanutIcon,
        iconTypes.PistachioIcon,
      ],
    },
    {
      orderOfNuts: [
        iconTypes.AlmondIcon,
        iconTypes.PeanutIcon,
        iconTypes.CashewIcon,
        iconTypes.PistachioIcon,
      ],
    },
  ];

  function addBoxRobotCard(parent, index, opt_classArray) {
    debugLog.debugLog(
      "BoxRobotCards",
      "Doug: addBoxRobotCard index = " + index
    );
    var config = cards.getCardConfigFromIndex(boxRobotCardConfigs, index);

    var classArray = genericUtils.growOptStringArray(opt_classArray, [
      "box_robot",
      "board_tile",
    ]);

    var cardId = "boxRobot_" + index;
    var front = cards.addCardFront(parent, classArray, cardId);

    boardTiles.twiddleBoardTile(front);

    var crossBarNode = htmlUtils.addImage(
      front,
      [miscTypes.CrossBar],
      miscTypes.CrossBar
    );

    for (var i = 0; i < config.orderOfNuts.length; i++) {
      var iconType = config.orderOfNuts[i];
      var quadrantId = "quadrant_" + i;
      var classArray = ["quadrant"];
      var quadrant = htmlUtils.addDiv(crossBarNode, classArray, quadrantId);

      var openBoxZIndex = config.length + i;
      var nutZIndex = config.length * 2 + i;

      var openBoxNode = htmlUtils.addImage(quadrant, ["openBox"], "openBox");
      var openBoxSizePercent = 40;
      var openBoxTopPercent = (50 - openBoxSizePercent) / 2 - 5;
      var openBoxLeftPercent = 50 - openBoxSizePercent / 2;
      domStyle.set(openBoxNode, {
        "z-index": openBoxZIndex,
        top: openBoxTopPercent + "%",
        left: openBoxLeftPercent + "%",
        width: openBoxSizePercent + "%",
        height: openBoxSizePercent + "%",
      });

      var nutImage = htmlUtils.addImage(
        quadrant,
        ["nut_type", iconType, "icon"],
        "nut_type"
      );
      var nutSizePercent = 25;
      var nutTopPercent = (50 - nutSizePercent) / 2 - 2.5;
      var nutLeftPercent = 50 - nutSizePercent / 2;
      domStyle.set(nutImage, {
        "z-index": nutZIndex,
        top: nutTopPercent + "%",
        left: nutLeftPercent + "%",
        width: nutSizePercent + "%",
        height: nutSizePercent + "%",
      });
    }
    return front;
  }

  function getNumCards() {
    var numCards = cards.getNumCardsFromConfigs(boxRobotCardConfigs);
    debugLog.debugLog(
      "BoxRobotCards",
      "Doug: BoxRobotCards main numCards = " + numCards
    );
    return numCards;
  }

  function getTopNutType(columnIndex, numQuarterTurns) {
    var config = cards.getCardConfigFromIndex(boxRobotCardConfigs, columnIndex);
    // Minus because of turn right/turn left arity issue,
    var nutIndex = numQuarterTurns % config.orderOfNuts.length;
    while (nutIndex < 0) {
      nutIndex += config.orderOfNuts.length;
    }
    var nutType = config.orderOfNuts[nutIndex];
    return nutType;
  }

  function setQuarterTurns(card, numQuarterTurns) {
    var deg = -90 * numQuarterTurns;
    domStyle.set(card, "transform", "rotate(" + deg + "deg)");
  }

  // This returned object becomes the defined value of this module
  return {
    addBoxRobotCard: addBoxRobotCard,
    getNumCards: getNumCards,
    getTopNutType: getTopNutType,
    setQuarterTurns: setQuarterTurns,
  };
});
