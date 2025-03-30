define([
  "javascript/iconTypes",
  "javascript/nutTypes",
  "dojo/domReady!",
], function (iconTypes, nutTypes) {
  var SalterMachine = "SalterMachine";
  var RoasterMachine = "RoasterMachine";
  var AlmondMachine = nutTypes.Almond + "Machine";
  var CashewMachine = nutTypes.Cashew + "Machine";
  var PeanutMachine = nutTypes.Peanut + "Machine";
  var PistachioMachine = nutTypes.Pistachio + "Machine";

  var orderedMachineTypes = [
    AlmondMachine,
    CashewMachine,
    PeanutMachine,
    PistachioMachine,
    SalterMachine,
    RoasterMachine,
  ];

  var orderedNutMachineTypes = [
    AlmondMachine,
    CashewMachine,
    PeanutMachine,
    PistachioMachine,
  ];

  var machineTypeToIconType = {
    SalterMachine: iconTypes.SalterIcon,
    RoasterMachine: iconTypes.RoasterIcon,
    AlmondMachine: iconTypes.AlmondIcon,
    CashewMachine: iconTypes.CashewIcon,
    PeanutMachine: iconTypes.PeanutIcon,
    PistachioMachine: iconTypes.PistachioIcon,
  };

  var machineTypesWithNoBeltTop = [];
  for (var i = 0; i < orderedMachineTypes.length; i++) {
    var machineType = orderedMachineTypes[i];
    machineTypesWithNoBeltTop[machineType] = true;
  }

  return {
    SalterMachine: SalterMachine,
    RoasterMachine: RoasterMachine,
    AlmondMachine: AlmondMachine,
    CashewMachine: CashewMachine,
    PeanutMachine: PeanutMachine,
    PistachioMachine: PistachioMachine,

    orderedMachineTypes: orderedMachineTypes,
    orderedNutMachineTypes: orderedNutMachineTypes,
    machineTypeToIconType: machineTypeToIconType,
    machineTypesWithNoBeltTop: machineTypesWithNoBeltTop,
  };
});
