define([
  "javascript/iconTypes",
  "javascript/nutTypes",
  "dojo/domReady!",
], function (iconTypes, nutTypes) {
  /* "Left" and "Right" talk about what side the paths connect.
  Cross: X
  JoinerLeft: |/
  JoinerRight: \|
  SplitterLeft: |\
  SplitterRight: /|
   */
  var Cross = "Cross";
  var JoinerLeft = "JoinerLeft";
  var JoinerRight = "JoinerRight";
  var SplitterLeft = "SplitterLeft";
  var SplitterRight = "SplitterRight";

  // "Left" and "Right" talk about what side the paths connect.
  var orderedConveyorTileTypes = [
    // X
    Cross,
    // |/
    JoinerLeft,
    // \|
    JoinerRight,
    // |\
    SplitterLeft,
    // /|
    SplitterRight,
  ];

  function isConveyorTileType(conveyorTileType) {
    for (var i = 0; i < orderedConveyorTileTypes.length; i++) {
      if (conveyorTileType == orderedConveyorTileTypes[i]) {
        return true;
      }
    }
    return false;
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
