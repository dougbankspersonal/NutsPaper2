// Sizes of Nuts-specific entities.

define([
  "sharedJavascript/debugLog",
  "sharedJavascript/genericMeasurements",
  "sharedJavascript/systemConfigs",
  "javascript/versionDetails",
  "dojo/domReady!",
], function (debugLog, genericMeasurements, systemConfigs, versionDetails) {
  var standardRowHeight = 180;
  var boxesRowHeight = standardRowHeight * 0.5;

  // Slots, elements, tiles.
  var slotWidth = 180;

  var elementHeight = slotWidth - 20;
  var elementWidth = elementHeight;

  var conveyorTileOnBoardLeftMargin = 20;
  var conveyorTileOnBoardTopMargin = 10;

  // For a tile, it lays across two side by side slots:
  //
  // Slots: +------a------+------a------+
  // Tile : +-c-+---------b---------+-c-+
  // Where a is slotWidth, b is conveyorTileWidth, and c is conveyorTileOnBoardLeftMargin.
  // So...
  var conveyorTileWidth = 2 * (slotWidth - conveyorTileOnBoardLeftMargin);
  var conveyorTileHeight = standardRowHeight - 2 * conveyorTileOnBoardTopMargin;

  var conveyorColumnsPerPage =
    genericMeasurements.getNumberThatFitAccountingForGap(
      genericMeasurements.adjustedPageWidth,
      conveyorTileWidth,
      genericMeasurements.standardPageGap
    );

  var totalBoardPadding = 50;
  var totalBoardWidth =
    versionDetails.getTotalNumColumns() * slotWidth + 2 * totalBoardPadding;
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

  var beltSegmentsPerRow = 8;
  var beltSegmentOffset = standardRowHeight / beltSegmentsPerRow;
  var beltSegmentHeight = beltSegmentOffset + 2;
  var beltSegmentWidth = 40;
  var beltSegmentGlobalZIndex = 100000;

  var smallCardWidth = slotWidth - 20;
  var smallCardHeight = 1.4 * smallCardWidth;
  var smallCardBackFontSize = smallCardWidth * 0.2;

  var smallCardFitHorizontally = Math.floor(
    genericMeasurements.adjustedPageWidth / smallCardWidth
  );
  var smallCardFitVertically = Math.floor(
    genericMeasurements.adjustedPageHeight / smallCardHeight
  );
  var smallCardsPerPage = smallCardFitHorizontally * smallCardFitVertically;

  var smallSquareFitHorizontally = Math.floor(
    genericMeasurements.adjustedPageWidth / smallCardWidth
  );
  var smallSquareFitVertically = Math.floor(
    genericMeasurements.adjustedPageHeight / smallCardWidth
  );
  var smallSquaresPerPage =
    smallSquareFitHorizontally * smallSquareFitVertically;

  var boxesRowMarginTop = 5;

  var beltZIndex = 2;
  var elementZIndex = beltZIndex + 1;
  var markerZIndex = elementZIndex + 1;
  var conveyorTileZIndex = markerZIndex + 1;
  var arrowZIndex = conveyorTileZIndex + 1;

  var shrinkage = 3;

  var iconCircleBorderSize = 8;
  var iconSize = 200;
  var iconCircleSize = iconSize - 2 * iconCircleBorderSize;
  var iconInnerImageSize = 0.85 * iconSize;

  var machineSize = elementWidth;

  function getFactoryRowHeight(rowType) {
    var sc = systemConfigs.getSystemConfigs();
    debugLog.debugLog(
      "Layout",
      "getFactoryRowHeight 001 sc = " + JSON.stringify(sc)
    );
    return standardRowHeight;
  }

  return {
    standardRowHeight: standardRowHeight,
    boxesRowHeight: boxesRowHeight,

    slotWidth: slotWidth,
    elementHeight: elementHeight,
    elementWidth: elementWidth,

    conveyorTileOnBoardLeftMargin: conveyorTileOnBoardLeftMargin,
    conveyorTileOnBoardTopMargin: conveyorTileOnBoardTopMargin,

    conveyorTileWidth: conveyorTileWidth,
    conveyorTileHeight: conveyorTileHeight,
    conveyorTileBorder: conveyorTileBorder,
    conveyorColumnsPerPage: conveyorColumnsPerPage,

    conveyorTileInnerWidth: conveyorTileInnerWidth,
    beltCenterOffsetInConveyorTile: beltCenterOffsetInConveyorTile,

    beltSegmentsPerRow: beltSegmentsPerRow,
    beltSegmentOffset: beltSegmentOffset,
    beltSegmentHeight: beltSegmentHeight,
    beltSegmentWidth: beltSegmentWidth,
    beltSegmentGlobalZIndex: beltSegmentGlobalZIndex,

    arrowWidth: elementWidth / 2,
    arrowHeight: elementHeight / 2,
    elementTopAndBottomMargin: (standardRowHeight - elementHeight) / 2,
    elementLeftAndRightMargin: (slotWidth - elementWidth) / 2,

    smallCardWidth: smallCardWidth,
    smallCardHeight: smallCardHeight,
    smallCardBackFontSize: smallCardBackFontSize,

    smallCardFitHorizontally: smallCardFitHorizontally,
    smallCardFitVertically: smallCardFitVertically,
    smallCardsPerPage: smallCardsPerPage,

    smallSquareFitHorizontally: smallSquareFitHorizontally,
    smallSquareFitVertically: smallSquareFitVertically,
    smallSquaresPerPage: smallSquaresPerPage,

    boxesRowMarginTop: boxesRowMarginTop,

    elementZIndex: elementZIndex,
    markerZIndex: markerZIndex,
    arrowZIndex: arrowZIndex,
    conveyorTileZIndex: conveyorTileZIndex,
    beltZIndex: beltZIndex,
    totalBoardWidth: totalBoardWidth,
    totalBoardPadding: totalBoardPadding,

    shrinkage: shrinkage,

    iconSize: iconSize,
    iconCircleSize: iconCircleSize,
    iconInnerImageSize: iconInnerImageSize,
    iconCircleBorderSize: iconCircleBorderSize,

    machineSize: machineSize,

    getFactoryRowHeight: getFactoryRowHeight,
  };
});
