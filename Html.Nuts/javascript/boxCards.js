define([
  "sharedJavascript/cards",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/nutTypes",
  "dojo/domReady!",
], function (cards, debugLog, genericUtils, htmlUtils, nutTypes) {
  function addNutDesc(parent, nutType) {
    debugLog.debugLog("Cards", "Doug: addNutDesc nutType = " + nutType);
    var wrapper = htmlUtils.addDiv(parent, ["wrapper"], "wrapper");
    var nutPropsTopNode = htmlUtils.addDiv(wrapper, ["nut_props"], "nutProps");

    var nutType;
    if (nutType == -1) {
      nutType = "Wild";
    }

    var prop = htmlUtils.addDiv(
      nutPropsTopNode,
      ["nut_prop", "nut_type"],
      "nutType"
    );
    htmlUtils.addImage(prop, ["nut_type", nutType], "nutType");
    return wrapper;
  }

  function addBoxCardSingleNut(parent, nutType, index, opt_classArray) {
    debugLog.debugLog(
      "Cards",
      "Doug: addBoxCardSingleNut nutType = " + nutType
    );
    var classArray = genericUtils.growOptStringArray(opt_classArray, "box");
    var cardId = "box.".concat(index.toString());
    var node = cards.addCardFront(parent, classArray, cardId);
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
    var nutType = nutTypes.nutTypes[nutTypeIndex];

    return addBoxCardSingleNut(parent, nutType, index, opt_classArray);
  }

  // This returned object becomes the defined value of this module
  return {
    addNthBoxCardSingleNut: addNthBoxCardSingleNut,
    addBoxCardSingleNut: addBoxCardSingleNut,
  };
});
