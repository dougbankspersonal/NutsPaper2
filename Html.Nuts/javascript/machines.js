define([
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/htmlUtils",
  "javascript/beltUtils",
  "javascript/measurements",
  "javascript/nutTypes",
  "dojo/domReady!",
], function (dom, domStyle, htmlUtils, beltUtils, measurements) {
  var machineTypes = [
    "Almond",
    "Cashew",
    "Peanut",
    "Pistachio",
    "Roaster",
    "Salter",
  ];

  var machineTypeToHideBeltTop = {
    Almond: true,
    Cashew: true,
    Peanut: true,
    Pistachio: true,
  };

  var machineTypeToImageMap = {
    Almond: "AlmondIcon.png",
    Cashew: "CashewIcon.png",
    Peanut: "PeanutIcon.png",
    Pistachio: "PistachioIcon.png",
    Roaster: "RoasterIcon.png",
    Salter: "SalterIcon.png",
  };

  function addMachine(parent, machineType) {
    console.log("addMachine: machineType = ", machineType);
    var machineNode = htmlUtils.addDiv(
      parent,
      ["machine", "board_tile"],
      machineType
    );
    domStyle.set(machineNode, {
      width: measurements.elementWidth + "px",
      height: measurements.elementWidth + "px",
    });

    var machineImage = htmlUtils.addImage(
      machineNode,
      ["machine_image"],
      "MachineImage",
      "../images/NutProps/Machine.png"
    );

    var imageName = machineTypeToImageMap[machineType];
    var iconImage = htmlUtils.addImage(
      machineNode,
      ["icon_image"],
      "IconImage",
      "../images/NutProps/" + imageName
    );

    // add Belt.
    var beltConfigs = {
      hideBeltTop: machineTypeToHideBeltTop[machineType],
      useLocalZIndex: true,
      xOffset: measurements.elementWidth / 2,
    };
    beltUtils.addStraightBelt(machineNode, beltConfigs);

    return machineNode;
  }

  function addMachines() {
    var bodyNode = dom.byId("body");
    var pageOfItems = htmlUtils.addPageOfItems(bodyNode);

    var machineContainer = htmlUtils.addDiv(
      pageOfItems,
      ["machine_container"],
      "machineContainer"
    );

    console.log("addMachine: machineTypes = ", machineType);

    for (var i = 0; i < machineTypes.length; i++) {
      var machineType = machineTypes[i];
      addMachine(machineContainer, machineType);
    }
    return bodyNode;
  }

  // This returned object becomes the defined value of this module
  return {
    addMachine: addMachine,
    addMachines: addMachines,
  };
});
