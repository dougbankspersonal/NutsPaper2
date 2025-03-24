define([
  "dojo/dom",
  "dojo/dom-style",
  "dojo/string",
  "sharedJavascript/htmlUtils",
  "javascript/measurements",
  "dojo/domReady!",
], function (dom, domStyle, string, htmlUtils, measurements) {
  var macnineIconConfigs = [
    {
      machineType: "Salter",
      borderColor: "999999",
      color: "#bbbbbb",
    },
    {
      machineType: "Roaster",
      borderColor: "997744",
      color: "#bb8866",
    },
  ];

  function addMachineIcon(parent, machineType) {
    var config;
    for (var i = 0; i < macnineIconConfigs.length; i++) {
      if (nutIconConfigs[i].machineType == machineType) {
        config = macnineIconConfigs[i];
        break;
      }
    }
    console.assert(
      config,
      "addNutIcon: machineType not found in macnineIconConfigs: " + machineType
    );
    var color = config.color;
    var otherColor = htmlUtils.blendHexColors(color, "#ffffff");
    var borderColor = config.borderColor;

    var iconNode = htmlUtils.addDiv(parent, ["machine", "icon"], machineType);
    domStyle.set(machineIconNode, {
      width: measurements.iconSize + "px",
      height: measurements.iconSize + "px",
    });

    var nutIconCircleNode = htmlUtils.addDiv(
      nutIconNode,
      ["nut_icon_circle"],
      "icon_inner"
    );
    var gradient = string.substitute("radial-gradient(${color1}, ${color2})", {
      color1: otherColor,
      color2: color,
    });
    var border = string.substitute("${borderSize}px solid #${color}", {
      borderSize: measurements.nutIconCircleBorderSize,
      color: borderColor,
    });

    console.log("border = ", border);

    domStyle.set(nutIconCircleNode, {
      border: border,
      background: gradient,
      width: measurements.nutIconCircleSize + "px",
      height: measurements.nutIconCircleSize + "px",
      zIndex: 1,
      borderRadius: "50%",
    });

    var image = htmlUtils.addImage(
      nutIconCircleNode,
      ["image", nutType],
      "image." + nutType,
      "../images/NutProps/" + nutType + ".png"
    );
    domStyle.set(image, {
      width: measurements.nutIconSize + "px",
      height: measurements.nutIconSize + "px",
      zIndex: 2,
    });
  }

  function addNutIcons() {
    var bodyNode = dom.byId("body");
    var pageOfItems = htmlUtils.addPageOfItems(bodyNode);

    var nutIconContainer = htmlUtils.addDiv(
      pageOfItems,
      ["nut_icon_container"],
      "nutContainer"
    );

    for (var i = 0; i < nutIconConfigs.length; i++) {
      var config = nutIconConfigs[i];
      var nutType = config.nutType;
      addNutIcon(nutIconContainer, nutType);
    }
    return bodyNode;
  }

  // This returned object becomes the defined value of this module
  return {
    addNutIcon: addNutIcon,
    addNutIcons: addNutIcons,
  };
});
