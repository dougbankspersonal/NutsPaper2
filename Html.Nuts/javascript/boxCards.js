define([
  "javascript/gameUtils",
  "sharedJavascript/htmlUtils",
  "dojo/dom-style",
  "dojo/domReady!",
], function (gameUtils, htmlUtils, domStyle) {
  function addBoxCardSingleNut(parent, nutType, index, opt_classArray) {
    var classArray = genericUtils.growOptStringArray(opt_classArray, "box");
    var cardId = "box.".concat(index.toString());
    var node = addCardFront(parent, classArray, cardId);
    addNutDesc(node, nutType);
    return node;
  }

  function addNthBoxCardSingleNut(
    parent,
    index,
    numBoxCardsEachType,
    opt_classArray
  ) {
    var nutTypeIndex = Math.floor(index / numBoxCardsEachType);
    var nutTypes = gameUtils.nutTypes;
    var nutType = nutTypes[nutTypeIndex];

    return addBoxCardSingleNut(parent, nutType, index, opt_classArray);
  }

  // This returned object becomes the defined value of this module
  return {
    addNthBoxCardSingleNut: addNthBoxCardSingleNut,
  };
});
