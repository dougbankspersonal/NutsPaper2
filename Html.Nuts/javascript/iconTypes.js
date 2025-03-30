define(["javascript/nutTypes", "dojo/domReady!"], function (nutTypes) {
  var AlmondIcon = nutTypes.Almond + "Icon";
  var CashewIcon = nutTypes.Cashew + "Icon";
  var PeanutIcon = nutTypes.Peanut + "Icon";
  var PistachioIcon = nutTypes.Pistachio + "Icon";
  var SalterIcon = "SalterIcon";
  var RoasterIcon = "RoasterIcon";

  var orderedIconTypes = [
    AlmondIcon,
    CashewIcon,
    PeanutIcon,
    PistachioIcon,
    SalterIcon,
    RoasterIcon,
  ];

  var orderedNutIconTypes = [AlmondIcon, CashewIcon, PeanutIcon, PistachioIcon];

  return {
    AlmondIcon: AlmondIcon,
    CashewIcon: CashewIcon,
    PeanutIcon: PeanutIcon,
    PistachioIcon: PistachioIcon,
    SalterIcon: SalterIcon,
    RoasterIcon: RoasterIcon,

    orderedIconTypes: orderedIconTypes,
    orderedNutIconTypes: orderedNutIconTypes,
  };
});
