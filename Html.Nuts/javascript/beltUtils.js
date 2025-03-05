define([
  "javascript/measurements",
  "sharedJavascript/htmlUtils",
  "dojo/dom-style",
  "dojo/domReady!",
], function (measurements, htmlUtils, domStyle) {
  function addBeltSegment(parentNode, xOffset, yOffset, opt_rads) {
    var beltSegment = htmlUtils.addDiv(
      parentNode,
      ["beltSegment"],
      "beltSegment"
    );
    var style = {
      left: `${xOffset}px`,
      top: `${yOffset}px`,
      "z-index": measurements.beltSegmentZIndex,
      height: `${measurements.beltSegmentHeight}px`,
      width: `${measurements.beltSegmentWidth}px`,
    };
    if (opt_rads != null) {
      style["transform"] = `translate(-50%, -50%	) rotate(${opt_rads}rad)`;
    }

    domStyle.set(beltSegment, style);
    measurements.beltSegmentZIndex--;
    return beltSegment;
  }

  // This returned object becomes the defined value of this module
  return {
    addBeltSegment: addBeltSegment,
  };
});
