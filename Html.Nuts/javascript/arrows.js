define([
  "javascript/rowTypes",
  "javascript/gameUtils",
  "javascript/measurements",
  "sharedJavascript/htmlUtils",
  "dojo/dom-style",
  "dojo/domReady!",
], function (rowTypes, gameUtils, measurements, htmlUtils, domStyle) {
  var arrowTypes = {
    LeftArrow: "LeftArrow",
    RightArrow: "RightArrow",
    DoubleArrow: "DoubleArrow",
  };

  var leftPx = measurements.slotWidth - measurements.arrowWidth / 2;
  var topPx = measurements.standardRowHeight / 2 - measurements.arrowHeight / 2;

  function addArrow(rowIndex, columnIndex, arrowType) {
    var classArray = ["arrow"];
    var slot = gameUtils.getSlot(rowIndex, columnIndex);
    var node = htmlUtils.addDiv(slot, classArray, "arrow.".concat(arrowType));
    domStyle.set(node, {
      "z-index": `${measurements.arrowZIndex}`,
      left: `${leftPx}px`,
      top: `${topPx}px`,
      width: `${measurements.arrowWidth}px`,
      height: `${measurements.arrowHeight}px`,
    });

    htmlUtils.addImage(node, ["image", arrowType], "image");

    return node;
  }

  return {
    arrowTypes: arrowTypes,
    addArrow: addArrow,
  };
});
