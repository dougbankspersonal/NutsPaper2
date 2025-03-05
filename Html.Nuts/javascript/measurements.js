// Sizes of Nuts-specific entities.

define([
  "javascript/rowTypes",
  "sharedJavascript/genericMeasurements",
  "dojo/domReady!",
], function (rowTypes, genericMeasurements) {
  var sidebarWidth = 360;

  // Slots, elements, tiles.
  var slotWidth = 180;

  var elementHeight = slotWidth - 20;
  var elementWidth = elementHeight;

  var conveyorTileOnBoardLeftMargin = 20;
  var conveyorTileOnBoardTopMargin = 10;

  var dieWidth = 150;
  var dieHeight = dieWidth;

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

  var beltSegmentZIndex = 1000000;
  var beltSegmentsPerRow = 8;
  var beltSegmentOffset = rowTypes.standardRowHeight / beltSegmentsPerRow;
  var beltSegmentHeight = beltSegmentOffset + 2;
  var beltSegmentWidth = 40;

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

  return {
    sidebarWidth: sidebarWidth,
    slotWidth: slotWidth,
    elementHeight: elementHeight,
    elementWidth: elementWidth,

    conveyorTileOnBoardLeftMargin: conveyorTileOnBoardLeftMargin,
    conveyorTileOnBoardTopMargin: conveyorTileOnBoardTopMargin,

    dieWidth: dieWidth,
    dieHeight: dieHeight,

    conveyorTileWidth: conveyorTileWidth,
    conveyorTileHeight: conveyorTileHeight,
    conveyorTileBorder: conveyorTileBorder,

    conveyorTileInnerWidth: conveyorTileInnerWidth,
    beltCenterOffsetInConveyorTile: beltCenterOffsetInConveyorTile,

    beltSegmentZIndex: beltSegmentZIndex,
    beltSegmentsPerRow: beltSegmentsPerRow,
    beltSegmentOffset: beltSegmentOffset,
    beltSegmentHeight: beltSegmentHeight,
    beltSegmentWidth: beltSegmentWidth,

    arrowWidth: elementWidth / 2,
    arrowHeight: elementHeight / 2,
    elementTopAndBottomMargin: (rowTypes.standardRowHeight - elementHeight) / 2,
    elementLeftAndRightMargin: (slotWidth - elementWidth) / 2,

    smallCardWidth: smallCardWidth,
    smallCardHeight: smallCardHeight,
    smallCardBackFontSize: smallCardBackFontSize,
    smallCardFitHorizontally: smallCardFitHorizontally,
    smallCardFitVertically: smallCardFitVertically,
    smallCardsPerPage: smallCardsPerPage,
  };
});
