define([
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "javascript/beltUtils",
  "javascript/markerTypes",
  "javascript/measurements",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  genericUtils,
  htmlUtils,
  beltUtils,
  markerTypes,
  measurements
) {
  var markersPerPage = 42;

  var markerConfigs = [
    {
      markerType: markerTypes.Squirrel,
      count: 1,
    },
  ];

  var numMarkerCards = 0;
  for (var i = 0; i < markerConfigs.length; i++) {
    numMarkerCards += markerConfigs[i].count;
  }

  console.assert(numMarkerCards <= markersPerPage, "Too many markers");

  function addMarker(parent, markerType, opt_classArray, opt_additionalConfig) {
    if (opt_classArray) {
      var isArray = Array.isArray(opt_classArray);
      if (!isArray) {
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
    var markerNode = htmlUtils.addDiv(
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

    domStyle.set(markerNode, {
      width: `${width}px`,
      height: `${height}px`,
      "z-index": `${measurements.markerZIndex}`,
    });

    var beltConfigs = {
      useLocalZIndex: true,
      leftPx: width / 2,
    };
    beltUtils.addStraightBelt(markerNode, beltConfigs);

    htmlUtils.addImage(markerNode, ["image", markerType], "image");

    var text = additionalConfig.text ? additionalConfig.text : null;

    if (text) {
      htmlUtils.addDiv(markerNode, ["text"], "text", text);
    }

    if (additionalConfig.color) {
      domStyle.set(markerNode, "background-color", additionalConfig.color);
    }

    return markerNode;
  }

  function addMarkers(pageOfItems) {
    for (var i = 0; i < markerConfigs.length; i++) {
      var markerConfig = markerConfigs[i];
      var count = markerConfig.count;
      for (var j = 0; j < count; j++) {
        addMarker(pageOfItems, markerConfig.markerType, null, markerConfig);
      }
    }
  }

  // This returned object becomes the defined value of this module
  return {
    addMarker: addMarker,
    addMarkers: addMarkers,
  };
});
