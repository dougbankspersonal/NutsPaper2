define([
  "dojo/dom",
  "dojo/dom-style",
  "dojo/query",
  "javascript/measurements",
  "sharedJavascript/genericMeasurements",
  "sharedJavascript/genericUtils",
  "sharedJavascript/htmlUtils",
  "sharedJavascript/systemConfigs",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  query,
  measurements,
  genericMeasurements,
  genericUtils,
  htmlUtils,
  systemConfigs
) {
  var starImage = "images/Markers/Star.png";
  var salterImage = "images/Markers/Salter.png";
  var squirrelImage = "images/Markers/Squirrel.png";

  var saltedTypes = ["Salted", "Unsalted"];

  var roastedTypes = ["Roasted", "Raw"];

  var saltedTypeImages = [
    "images/NutProps/Salted.Y.png",
    "images/NutProps/Salted.N.png",
  ];
  var roastedTypeImages = [
    "images/NutProps/Roasted.Y.png",
    "images/NutProps/Roasted.N.png",
  ];

  var wildImage = "images/Order/Order.Wild.png";

  function getSlotId(rowIndex, columnIndex) {
    var idPieces = ["slot", rowIndex.toString(), columnIndex.toString()];
    return idPieces.join("_");
  }

  function getRowId(rowIndex) {
    var idPieces = ["row", rowIndex.toString()];
    return idPieces.join("_");
  }

  function getElementId(columnIndex) {
    var elementId = "element_".concat(columnIndex.toString());
    return elementId;
  }

  function getElementFromRow(rowNode, columnIndex) {
    var elementId = getElementId(columnIndex);
    var elementNodes = query(`#${elementId}`, rowNode);
    return elementNodes[0];
  }

  function addRow(parent, opt_classArray, rowIndex) {
    var sc = systemConfigs.getSystemConfigs();
    console.assert(parent, "parent is null");
    var classArray = genericUtils.growOptStringArray(opt_classArray, "row");
    if (sc.pageless) {
      classArray.push("demo_board");
    }
    var rowId = getRowId(rowIndex);
    var row = htmlUtils.addDiv(parent, classArray, rowId);
    return row;
  }

  function getSlot(rowIndex, columnIndex) {
    var slotId = getSlotId(rowIndex, columnIndex);
    return dom.byId(slotId);
  }

  function generateDemoBoardSystemConfigs() {
    var c = {
      // Not a typo, the cards are square.
      cardHeight: measurements.smallCardWidth,
      cardWidth: measurements.smallCardWidth,
      cardBackFontSize: measurements.smallCardBackFontSize,
      pageless: true,
      extraClassesForPageOfItemsContents: ["demo_board"],
      explicitPageWidth: measurements.totalBoardWidth,
      pageOfItemsContentsPaddingPx: measurements.totalBoardPadding,
    };
    return c;
  }

  // This returned object becomes the defined value of this module
  return {
    starImage: starImage,
    salterImage: salterImage,
    squirrelImage: squirrelImage,

    saltedTypes: saltedTypes,
    numSaltedTypes: saltedTypes.length,
    saltedTypeImages: saltedTypeImages,

    roastedTypes: roastedTypes,
    numRoastedTypes: roastedTypes.length,
    roastedTypeImages: roastedTypeImages,

    wildImage: wildImage,

    addRow: addRow,
    getSlot: getSlot,
    getSlotId: getSlotId,
    getRowId: getRowId,
    getElementId: getElementId,
    getElementFromRow: getElementFromRow,
    generateDemoBoardSystemConfigs: generateDemoBoardSystemConfigs,
  };
});
