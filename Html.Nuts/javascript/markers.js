define([
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/nutTypes",
  "javascript/measurements",
  "dojo/domReady!",
], function (dom, domStyle, genericUtils, htmlUtils, nutTypes, measurements) {
  var markerTypes = {
    Almond: nutTypes.nutTypeAlmond,
    Cashew: nutTypes.nutTypeCashew,
    Peanut: nutTypes.nutTypePeanut,
    Pistachio: nutTypes.nutTypePistachio,
    Roaster: "Roaster",
    Salter: "Salter",
    ScoreCell: "ScoreCell",
    Squirrel: "Squirrel",
    StartingPlayer: "StartingPlayer",

    // For demo.
    Heart: "Heart",
    Skull: "Skull",
    Star: "Star",
  };

  var markerTypeToImageMap = {
    Almond: "almond.png",
    Cashew: "cashew.png",
    Peanut: "peanut.png",
    Pistachio: "pistachio.png",
    Roaster: "roaster.png",
    Salter: "salter.png",
    ScoreCell: "scoreCell.png",
    Squirrel: "squirrel.png",
    StartingPlayer: "startingPlayer.png",

    // For demo.
    Heart: "heart.png",
    Skull: "skull.png",
    Star: "star.png",
  };

  var markersPerPage = 42;

  function addMarker(parent, markerType, opt_classArray, opt_additionalConfig) {
    if (opt_classArray) {
      var isArray = Array.isArray(opt_classArray);
      if (!isArray) {
        console.log("opt_classArray == ", opt_classArray);
        console.log("opt_classArray type: ", typeof opt_classArray);
        console.assert(
          Array.isArray(opt_classArray),
          "opt_classArray must be an array"
        );
      }
    }
    var classArray = genericUtils.growOptStringArray(opt_classArray, [
      "marker",
      "board_tile",
    ]);
    classArray.push(markerType);
    var additionalConfig = opt_additionalConfig ? opt_additionalConfig : {};
    var node = htmlUtils.addDiv(
      parent,
      classArray,
      "marker.".concat(markerType)
    );

    var height = additionalConfig.height
      ? additionalConfig.height
      : measurements.elementHeight - measurements.shrinkage;
    var width = additionalConfig.width
      ? additionalConfig.width
      : measurements.elementWidth - measurements.shrinkage;

    domStyle.set(node, {
      width: `${width}px`,
      height: `${height}px`,
      "z-index": `${measurements.markerZIndex}`,
    });

    htmlUtils.addImage(node, ["image", markerType], "image");

    var text = additionalConfig.text ? additionalConfig.text : null;

    if (text) {
      htmlUtils.addDiv(node, ["text"], "text", text);
    }

    if (additionalConfig.color) {
      domStyle.set(node, "background-color", additionalConfig.color);
    }

    return node;
  }

  // This returned object becomes the defined value of this module
  return {
    markerTypes: markerTypes,
    addMarker: addMarker,
    addMarkers: function (numMarkers, contentCallback) {
      var bodyNode = dom.byId("body");
      var pageOfMarkers = null;
      for (var i = 0; i < numMarkers; i++) {
        if (i % markersPerPage == 0) {
          pageOfMarkers = htmlUtils.addPageOfItems(bodyNode);
        }
        contentCallback(pageOfMarkers, i);
      }
    },
  };
});
