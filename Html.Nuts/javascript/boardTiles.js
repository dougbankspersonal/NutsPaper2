define([
  "javascript/rowTypes",
  "javascript/gameUtils",
  "javascript/measurements",
  "sharedJavascript/htmlUtils",
  "dojo/dom-style",
  "dojo/domReady!",
], function (rowTypes, gameUtils, measurements, htmlUtils, domStyle) {
  function twiddleBoardTile(boardTileNode) {
    var randomPercentageX = 5 + Math.random() * 55;
    var randomPercentageY = 5 + Math.random() * 55;
    domStyle.set(boardTileNode, {
      "background-position": `${randomPercentageX}% ${randomPercentageY}%`,
    });
  }

  return {
    twiddleBoardTile: twiddleBoardTile,
  };
});
