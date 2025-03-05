define([
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/dom-style",
  "dojo/query",
  "javascript/measurements",
  "javascript/rowTypes",
  "javascript/versionDetails",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericMeasurements",
  "sharedJavascript/systemConfigs",
  "dojo/domReady!",
], function (
  dom,
  domConstruct,
  domStyle,
  query,
  measurements,
  rowTypes,
  versionDetails,
  debugLog,
  genericMeasurements,
  systemConfigs
) {
  var pageNumber = 0;
  var cardNumber = 0;

  // Slots, elements, tiles.
  var slotWidth = 180;

  var elementHeight = slotWidth - 20;
  var elementWidth = elementHeight;

  var conveyorTileOnBoardLeftMargin = 20;
  var conveyorTileOnBoardTopMargin = 10;

  var dieWidth = 150;
  var dieHeight = dieWidth;
  var dieColulmnsAcross = 3;

  // For a tile, it lays across two side by side slots:
  //
  // Slots: +------a------+------a------+
  // Tile : +-c-+---------b---------+-c-+
  // Where a is slotWidth, b is conveyorTileWidth, and c is conveyorTileOnBoardLeftMargin.
  // So...
  var conveyorTileWidth = 2 * (slotWidth - conveyorTileOnBoardLeftMargin);
  var conveyorTileHeight =
    rowTypes.standardRowHeight - 2 * conveyorTileOnBoardTopMargin;

  // So we have this:
  // +------a------+------a------+
  // +-c-+---------b---------+-c-+
  // where b is the width of a tile, and c is conveyorTileOnBoardLeftMargin.
  // There's also a margin:
  var conveyorTileBorder = 2;

  // Border on both sides: the space inside the tile is actually this big:
  var conveyorTileInnerWidth = conveyorTileWidth - 2 * conveyorTileBorder;

  // So if belt elements are children of the tile div, what is the position that'd
  // put the belt in the center of a slot?
  var beltCenterOffsetInConveyorTile =
    slotWidth / 2 - conveyorTileOnBoardLeftMargin - conveyorTileBorder;

  // Cards.
  var smallCardWidth = slotWidth - 20;
  var smallCardHeight = 1.4 * smallCardWidth;
  var smallCardBackFontSize = smallCardWidth * 0.2;
  var cardBorderWidth = 5;

  var cardWidth = 1.4 * smallCardWidth;
  var cardHeight = 1.4 * smallCardHeight;
  var cardBackFontSize = cardWidth * 0.2;

  var ttsSmallCardPageWidth = 10 * smallCardWidth;
  var ttsCardPageWidth = 10 * cardWidth;

  var boxesRowMarginTop = 5;

  var nutTypeAlmond = "Almond";
  var nutTypeCashew = "Cashew";
  var nutTypePeanut = "Peanut";
  var nutTypePistachio = "Pistachio";

  var nutTypes = [
    nutTypeAlmond,
    nutTypeCashew,
    nutTypePeanut,
    nutTypePistachio,
  ];

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

  function addStandardBorder(node) {
    domStyle.set(node, {
      border: genericMeasurements.standardBorderWidth + "px solid black",
    });
  }

  function isString(value) {
    return typeof value === "string";
  }

  function extendOptClassArray(opt_classArray, newClassOrClasses) {
    debugLog.debugLog(
      "ScoringTrack",
      "extendOptClassArray: opt_classArray == " + opt_classArray
    );
    debugLog.debugLog(
      "ScoringTrack",
      "extendOptClassArray: newClassOrClasses == " + newClassOrClasses
    );
    var classArray = opt_classArray ? opt_classArray : [];
    console.assert(
      typeof classArray === "object",
      "classArray is not an object"
    );
    if (isString(newClassOrClasses)) {
      classArray.push(newClassOrClasses);
      return classArray;
    } else {
      // must be an array
      var newClassArray = classArray.concat(newClassOrClasses);
      return newClassArray;
    }
  }

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
    var classArray = extendOptClassArray(opt_classArray, "row");
    if (sc.demoBoard) {
      classArray.push("demoBoard");
    }
    var rowId = getRowId(rowIndex);
    var row = htmlUtils.addDiv(parent, classArray, rowId);
    return row;
  }

  var cardSlotOutlineHeight = 4;

  var beltSegmentZIndex = 1000000;
  var beltZIndex = 2;
  var elementZIndex = beltZIndex + 1;
  var markerZIndex = elementZIndex + 1;
  var conveyorTileZIndex = markerZIndex + 1;
  var arrowZIndex = conveyorTileZIndex + 1;

  var beltSegmentsPerRow = 8;
  var beltSegmentOffset = rowTypes.standardRowHeight / beltSegmentsPerRow;
  var beltSegmentHeight = beltSegmentOffset + 2;
  var beltSegmentWidth = 40;

  function getSlot(rowIndex, columnIndex) {
    var slotId = getSlotId(rowIndex, columnIndex);
    return dom.byId(slotId);
  }

  // This returned object becomes the defined value of this module
  return {
    slotWidth: slotWidth,
    beltCenterOffsetInConveyorTile: beltCenterOffsetInConveyorTile,
    elementHeight: elementHeight,
    elementWidth: elementWidth,
    arrowWidth: elementWidth / 2,
    arrowHeight: elementHeight / 2,
    elementTopAndBottomMargin: (rowTypes.standardRowHeight - elementHeight) / 2,
    elementLeftAndRightMargin: (slotWidth - elementWidth) / 2,
    conveyorTileWidth: conveyorTileWidth,
    conveyorTileHeight: conveyorTileHeight,
    conveyorTileBorder: conveyorTileBorder,
    conveyorTileInnerWidth: conveyorTileInnerWidth,
    beltSegmentZIndex: beltSegmentZIndex,
    beltSegmentsPerRow: beltSegmentsPerRow,
    beltSegmentOffset: beltSegmentOffset,
    beltSegmentHeight: beltSegmentHeight,
    beltSegmentWidth: beltSegmentWidth,

    nutTypeAlmond: nutTypeAlmond,
    nutTypeCashew: nutTypeCashew,
    nutTypePeanut: nutTypePeanut,
    nutTypePistachio: nutTypePistachio,

    smallCardHeight: smallCardHeight,
    smallCardWidth: smallCardWidth,
    smallCardBackFontSize: smallCardBackFontSize,

    cardHeight: cardHeight,
    cardWidth: cardWidth,
    cardBackFontSize: cardBackFontSize,

    nutTypes: nutTypes,
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
    boxesRowMarginTop: boxesRowMarginTop,
    cardSlotOutlineHeight: cardSlotOutlineHeight,
    elementZIndex: elementZIndex,
    markerZIndex: markerZIndex,
    arrowZIndex: arrowZIndex,
    conveyorTileZIndex: conveyorTileZIndex,
    beltZIndex: beltZIndex,
    conveyorTileOnBoardLeftMargin: conveyorTileOnBoardLeftMargin,
    conveyorTileOnBoardTopMargin: conveyorTileOnBoardTopMargin,
    dieWidth: dieWidth,
    dieHeight: dieHeight,
    cardBorderWidth: cardBorderWidth,

    addRow: addRow,
    getSlot: getSlot,
    extendOptClassArray: extendOptClassArray,
    getSlotId: getSlotId,
    getRowId: getRowId,
    getElementId: getElementId,
    getElementFromRow: getElementFromRow,
    addStandardBorder: addStandardBorder,
  };
});
