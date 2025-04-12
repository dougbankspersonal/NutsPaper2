define([
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/htmlUtils",
  "javascript/beltUtils",
  "javascript/measurements",
  "javascript/machineTypes",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  debugLog,
  htmlUtils,
  beltUtils,
  measurements,
  machineTypes
) {
  function addMachine(parent, machineType) {
    console.assert(machineType, "addMachine: machineType is required");
    var machineWrapperNode = htmlUtils.addDiv(
      parent,
      ["machine_wrapper", "board_tile"],
      machineType
    );
    domStyle.set(machineWrapperNode, {
      width: measurements.elementWidth + "px",
      height: measurements.elementWidth + "px",
    });

    var machineImage = htmlUtils.addImage(
      machineWrapperNode,
      ["Machine"],
      "MachineImage"
    );

    var iconType = machineTypes.machineTypeToIconType[machineType];

    debugLog.debugLog("Machines", "addMachine: machineType = " + machineType);
    debugLog.debugLog("Machines", "addMachine: iconType = " + iconType);

    var iconImage = htmlUtils.addImage(
      machineWrapperNode,
      ["icon_image", iconType],
      "IconImage"
    );

    var hideBeltTop = machineTypes.machineTypeToHasBeltTop[machineType];
    debugLog.debugLog("Machines", "addMachine: hideBeltTop = " + hideBeltTop);

    // add Belt.
    var beltConfigs = {
      hideBeltTop: hideBeltTop,
      useLocalZIndex: true,
      xOffset: measurements.elementWidth / 2,
    };
    beltUtils.addStraightBelt(machineWrapperNode, beltConfigs);

    return machineWrapperNode;
  }

  function addMachines() {
    var bodyNode = dom.byId("body");
    var pageOfItems = htmlUtils.addPageOfItems(bodyNode);

    var machineContainer = htmlUtils.addDiv(
      pageOfItems,
      ["machines_container"],
      "machinesContainer"
    );

    for (var i = 0; i < machineTypes.orderedMachineTypes.length; i++) {
      var machineType = machineTypes.orderedMachineTypes[i];
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
