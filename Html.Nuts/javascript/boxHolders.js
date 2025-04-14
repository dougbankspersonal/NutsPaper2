define([
  "dojo/dom-style",
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
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
  iconTypes,
  miscTypes
) {
  var boxHolderCardConfigs = [
    {
      orderOfNutIconTypes: [
        iconTypes.AlmondIcon,
        iconTypes.CashewIcon,
        iconTypes.PeanutIcon,
        iconTypes.PistachioIcon,
      ],
    },
    {
      orderOfNutIconTypes: [
        iconTypes.AlmondIcon,
        iconTypes.CashewIcon,
        iconTypes.PistachioIcon,
        iconTypes.PeanutIcon,
      ],
    },
    {
      orderOfNutIconTypes: [
        iconTypes.AlmondIcon,
        iconTypes.PeanutIcon,
        iconTypes.CashewIcon,
        iconTypes.PistachioIcon,
      ],
    },
    {
      orderOfNutIconTypes: [
        iconTypes.AlmondIcon,
        iconTypes.PeanutIcon,
        iconTypes.PistachioIcon,
        iconTypes.CashewIcon,
      ],
    },
    {
      orderOfNutIconTypes: [
        iconTypes.AlmondIcon,
        iconTypes.PistachioIcon,
        iconTypes.CashewIcon,
        iconTypes.PeanutIcon,
      ],
    },
    {
      orderOfNutIconTypes: [
        iconTypes.AlmondIcon,
        iconTypes.PistachioIcon,
        iconTypes.PeanutIcon,
        iconTypes.CashewIcon,
      ],
    },
    {
      orderOfNutIconTypes: [
        iconTypes.AlmondIcon,
        iconTypes.CashewIcon,
        iconTypes.PeanutIcon,
        iconTypes.PistachioIcon,
      ],
    },
    {
      orderOfNutIconTypes: [
        iconTypes.AlmondIcon,
        iconTypes.PeanutIcon,
        iconTypes.CashewIcon,
        iconTypes.PistachioIcon,
      ],
    },
  ];

  function addBoxHolderCard(parent, index, opt_classArray) {
    debugLog.debugLog(
      "BoxHolderCards",
      "Doug: addBoxHolderCard index = " + index
    );
    var config = cards.getCardConfigFromIndex(boxHolderCardConfigs, index);

    var classArray = genericUtils.growOptStringArray(opt_classArray, [
      "box_holder",
      "board_tile",
    ]);

    var cardId = "boxHolder_" + index;
    var front = cards.addCardFront(parent, classArray, cardId);

    var crossBarNode = htmlUtils.addImage(
      front,
      [miscTypes.CrossBar],
      miscTypes.CrossBar
    );

    for (var i = 0; i < config.orderOfNutIconTypes.length; i++) {
      var iconType = config.orderOfNutIconTypes[i];
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
    var numCards = cards.getNumCardsFromConfigs(boxHolderCardConfigs);
    debugLog.debugLog(
      "BoxHolderCards",
      "Doug: BoxHolderCards main numCards = " + numCards
    );
    return numCards;
  }

  function getTopNutType(columnIndex, numQuarterRightTurns) {
    var config = cards.getCardConfigFromIndex(
      boxHolderCardConfigs,
      columnIndex
    );
    //
    var nutIndex = numQuarterRightTurns % config.orderOfNutIconTypes.length;
    while (nutIndex < 0) {
      nutIndex += config.orderOfNutIconTypes.length;
    }
    var nutType = config.orderOfNutIconTypes[nutIndex];
    return nutType;
  }

  function setQuarterRightTurns(card, numQuarterRightTurns) {
    var deg = 90 * numQuarterRightTurns;
    domStyle.set(card, "transform", "rotate(" + deg + "deg)");
  }

  // This returned object becomes the defined value of this module
  return {
    addBoxHolderCard: addBoxHolderCard,
    getNumCards: getNumCards,
    getTopNutType: getTopNutType,
    setQuarterRightTurns: setQuarterRightTurns,

    boxHolderCardConfigs: boxHolderCardConfigs,
  };
});
