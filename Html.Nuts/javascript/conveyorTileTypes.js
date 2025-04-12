define([
  "javascript/iconTypes",
  "javascript/nutTypes",
  "dojo/domReady!",
], function (iconTypes, nutTypes) {
  var Cross = "Cross"; // X
  // If type ends in left/right, and it's a joiner. that's the direction th diag moves top to bottom.
  var JoinerLeft = "JoinerLeft"; // |/
  var JoinerRight = "JoinerRight"; // \|
  // If type ends in left/right, and it's a splitter. that's the direction th diag moves top to bottom.
  var SplitterLeft = "SplitterLeft"; // /|
  var SplitterRight = "SplitterRight"; // |\

  var orderedConveyorTileTypes = [
    Cross,
    JoinerLeft,
    JoineRight,
    SplitterLeft,
    SplitterRight,
  ];

  function isConveyorTileType(conveyorTileType) {
    return conveyorTileTypes[conveyorTileType] != null;
  }

  return {
    Cross: Cross,
    JoinerLeft: JoinerLeft,
    JoinerRight: JoinerRight,
    SplitterLeft: SplitterLeft,
    SplitterRight: SplitterRight,

    orderedConveyorTileTypes: orderedConveyorTileTypes,
    isConveyorTileType: isConveyorTileType,
  };
});
