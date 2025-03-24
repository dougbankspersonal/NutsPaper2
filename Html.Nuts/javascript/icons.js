define([
  "dojo/dom",
  "dojo/dom-style",
  "dojo/string",
  "sharedJavascript/htmlUtils",
  "javascript/markers",
  "javascript/nutTypes",
  "javascript/measurements",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  string,
  htmlUtils,
  markers,
  nutTypes,
  measurements
) {
  var iconConfigs = [
    {
      iconType: nutTypes.nutTypeAlmond,
      borderColor: "#ff0000",
      color: "#bb6666",
    },
    {
      iconType: nutTypes.nutTypeCashew,
      borderColor: "#ffff00",
      color: "#bbbb66",
    },
    {
      iconType: nutTypes.nutTypePeanut,
      borderColor: "#0000ff",
      color: "#6666bb",
    },
    {
      iconType: nutTypes.nutTypePistachio,
      borderColor: "#00ff00",
      color: "#66bb66",
    },
    {
      iconType: markers.markerTypes.Salter,
      borderColor: "#dddddd",
      color: "#bbbbbb",
    },
    {
      iconType: markers.markerTypes.Roaster,
      borderColor: "#ffaa00",
      color: "#bb9966",
    },
  ];

  function addIcon(parent, iconType) {
    var config;
    for (var i = 0; i < iconConfigs.length; i++) {
      if (iconConfigs[i].iconType == iconType) {
        config = iconConfigs[i];
        break;
      }
    }
    console.assert(
      config,
      "addIcon: iconType not found in iconConfigs: " + iconType
    );
    var color = config.color;
    var otherColor = htmlUtils.blendHexColors(color, "#ffffff");
    var borderColor = config.borderColor;

    var iconNode = htmlUtils.addDiv(parent, ["icon"], iconType);
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

    console.log("border = ", border);

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
      ["image", iconType],
      "image." + iconType,
      "../images/NutProps/" + iconType + ".png"
    );
    domStyle.set(innerImage, {
      width: measurements.iconInnerImageSize + "px",
      height: measurements.iconInnerImageSize + "px",
      zIndex: 2,
    });
  }

  function addIcons() {
    var bodyNode = dom.byId("body");
    var pageOfItems = htmlUtils.addPageOfItems(bodyNode);

    var iconContainer = htmlUtils.addDiv(
      pageOfItems,
      ["icon_container"],
      "iconConctainer"
    );

    for (var i = 0; i < iconConfigs.length; i++) {
      var config = iconConfigs[i];
      var iconType = config.iconType;
      addIcon(iconContainer, iconType);
    }
    return bodyNode;
  }

  // This returned object becomes the defined value of this module
  return {
    addIcon: addIcon,
    addIcons: addIcons,
  };
});
