define([
  "javascript/gameUtils",
  "sharedJavascript/cards",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "dojo/domReady!",
], function (gameUtils, cards, genericUtils, htmlUtils) {
  function addNutDesc(parent, nutType) {
    var wrapper = htmlUtils.addDiv(parent, ["wrapper"], "wrapper");
    var nutPropsTopNode = htmlUtils.addDiv(wrapper, ["nutProps"], "nutProps");

    var nutType;
    if (nutType == -1) {
      nutType = "Wild";
    }

    var prop = htmlUtils.addDiv(
      nutPropsTopNode,
      ["nutProp", "nut_type"],
      "nut_type"
    );
    htmlUtils.addImage(prop, ["nutType", nutType], "nut_type");
    return wrapper;
  }

  function addBoxCardSingleNut(parent, nutType, index, opt_classArray) {
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
    var nutTypes = gameUtils.nutTypes;
    var nutType = nutTypes[nutTypeIndex];

    return addBoxCardSingleNut(parent, nutType, index, opt_classArray);
  }

  // This returned object becomes the defined value of this module
  return {
    addNthBoxCardSingleNut: addNthBoxCardSingleNut,
    addBoxCardSingleNut: addBoxCardSingleNut,
  };
});
