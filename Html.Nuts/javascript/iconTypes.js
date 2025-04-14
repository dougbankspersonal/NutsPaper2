define([
  "sharedJavascript/debugLog",
  "javascript/nutTypes",
  "dojo/domReady!",
], function (debugLog, nutTypes) {
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

  var iconTypeToNutTypeMap = {
    [AlmondIcon]: nutTypes.Almond,
    [CashewIcon]: nutTypes.Cashew,
    [PeanutIcon]: nutTypes.Peanut,
    [PistachioIcon]: nutTypes.Pistachio,
  };

  function getNutTypeFromIconType(iconType) {
    debugLog.debugLog(
      "Highlights",
      "getNutTypeFromIconType: iconType = " + iconType
    );
    debugLog.debugLog(
      "Highlights",
      "getNutTypeFromIconType: iconTypeToNutTypeMap = " +
        JSON.stringify(iconTypeToNutTypeMap)
    );
    if (iconTypeToNutTypeMap[iconType]) {
      return iconTypeToNutTypeMap[iconType];
    }
    console.error("Invalid icon type: " + iconType);
  }

  return {
    AlmondIcon: AlmondIcon,
    CashewIcon: CashewIcon,
    PeanutIcon: PeanutIcon,
    PistachioIcon: PistachioIcon,
    SalterIcon: SalterIcon,
    RoasterIcon: RoasterIcon,

    orderedIconTypes: orderedIconTypes,
    orderedNutIconTypes: orderedNutIconTypes,
    getNutTypeFromIconType: getNutTypeFromIconType,
  };
});
