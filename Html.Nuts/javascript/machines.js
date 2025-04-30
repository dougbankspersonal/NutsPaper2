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
      leftPx: measurements.elementWidth / 2,
    };
    beltUtils.addStraightBelt(machineWrapperNode, beltConfigs);

    return machineWrapperNode;
  }

  function addMachines(pageOfItems, singleInstance) {
    var instanceCount = singleInstance ? 1 : 2;
    for (var i = 0; i < machineTypes.orderedMachineTypes.length; i++) {
      for (var j = 0; j < instanceCount; j++) {
        var machineType = machineTypes.orderedMachineTypes[i];
        addMachine(pageOfItems, machineType);
      }
    }
  }

  // This returned object becomes the defined value of this module
  return {
    addMachine: addMachine,
    addMachines: addMachines,
  };
});
