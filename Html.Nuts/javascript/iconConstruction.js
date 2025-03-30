// Used to generate HTML from which we can screen-cap icons.
define([
  "dojo/dom",
  "dojo/dom-style",
  "dojo/string",
  "sharedJavascript/htmlUtils",
  "javascript/iconConstructionConfigs",
  "javascript/measurements",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  string,
  htmlUtils,
  iconConstructionConfigs,
  measurements
) {
  function addConstructedIcon(parent, config) {
    console.assert(config, "addConstructedIcon: config is required");
    var iconImage = config.iconImage;
    console.assert(iconImage, "addConstructedIcon: iconImage is required");
    var color = config.color;

    var otherColor = htmlUtils.blendHexColors(color, "#ffffff");
    var borderColor = config.borderColor;

    var iconNode = htmlUtils.addImage(parent, ["icon"], iconImage);
    domStyle.set(iconNode, {
      width: measurements.iconSize + "px",
      height: measurements.iconSize + "px",
    });

    var iconCircleNode = htmlUtils.addDiv(
      iconNode,
      ["icon_circle"],
      "iconCircle"
    );
    var gradient = string.substitute("radial-gradient(${color1}, ${color2})", {
      color1: otherColor,
      color2: color,
    });
    var border = string.substitute("${borderSize}px solid ${color}", {
      borderSize: measurements.iconCircleBorderSize,
      color: borderColor,
    });

    domStyle.set(iconCircleNode, {
      border: border,
      background: gradient,
      width: measurements.iconCircleSize + "px",
      height: measurements.iconCircleSize + "px",
      zIndex: 1,
      borderRadius: "50%",
    });

    var innerImage = htmlUtils.addImage(
      iconCircleNode,
      ["image", iconImage],
      "image." + iconImage
    );
    domStyle.set(innerImage, {
      width: measurements.iconInnerImageSize + "px",
      height: measurements.iconInnerImageSize + "px",
      zIndex: 2,
    });
  }

  function addConstructedIcons() {
    var bodyNode = dom.byId("body");
    var pageOfItems = htmlUtils.addPageOfItems(bodyNode);

    var iconContainer = htmlUtils.addDiv(
      pageOfItems,
      ["icon_container"],
      "iconConctainer"
    );

    for (var i = 0; i < iconConstructionConfigs.length; i++) {
      var config = iconConstructionConfigs[i];
      addConstructedIcon(iconContainer, config);
    }
    return bodyNode;
  }

  // This returned object becomes the defined value of this module
  return {
    addConstructedIcons: addConstructedIcons,
  };
});
