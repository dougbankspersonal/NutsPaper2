define([
  "javascript/gameUtils",
  "sharedJavascript/cards",
  "dojo/domReady!",
], function (gameUtils, cards) {
  function mapIndexToCardType(index, goalCardConfigs) {
    for (var i = 0; i < goalCardConfigs.length; i++) {
      if (index < goalCardConfigs[i].count) {
        return i;
      }
      index -= goalCardConfigs[i].count;
    }
    // How did we get here?
    console.assert("mapIndexToCardType error");
    return 0;
  }

  function addGoalCard(parent, index, goalCardConfigs) {
    var cardType = mapIndexToCardType(index, goalCardConfigs);
    var frontNode = cards.addCardFront(
      parent,
      ["goal"],
      "goal.".concat(index.toString())
    );
    var config = goalCardConfigs[cardType];
    if (config.title) {
      var node = htmlUtils.addDiv(frontNode, ["title"], "title");
      node.innerHTML = config.title;
    }
    if (config.goal) {
      var node = htmlUtils.addDiv(frontNode, ["goal"], "goal");
      node.innerHTML = config.goal;
    }
    if (config.points) {
      var node = htmlUtils.addDiv(frontNode, ["points"], "points");
      node.innerHTML = config.points;
    }
    if (config.reward) {
      var node = htmlUtils.addDiv(frontNode, ["reward"], "reward");
      node.innerHTML = config.reward;
    }
  }

  function getCount(goalCardConfigs) {
    var numGoalCards = 0;
    for (var i = 0; i < goalCardConfigs.length; i++) {
      numGoalCards = numGoalCards + goalCardConfigs[i].count;
    }
    return numGoalCards;
  }

  // This returned object becomes the defined value of this module
  return {
    addGoalCard: addGoalCard,
    getCount: getCount,
  };
});
