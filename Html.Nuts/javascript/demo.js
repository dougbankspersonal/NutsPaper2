define([
  "sharedJavascript/genericUtils",
  "javascript/conveyorTileTypes",
  "javascript/gameUtils",
  "javascript/highlights",
  "javascript/machineTypes",
  "javascript/markerTypes",
  "javascript/placeConveyorTileOnBoard",
  "javascript/placeElementOnBoard",
  "javascript/rowTypes",
  "javascript/versionDetails",
  "dojo/domReady!",
], function (
  genericUtils,
  conveyorTileTypes,
  gameUtils,
  highlights,
  machineTypes,
  markerTypes,
  placeConveyorTileOnBoard,
  placeElementOnBoard,
  rowTypes,
  versionDetails
) {
  var redHighlightColor = "rgba(255, 128, 128, 1)";
  var blueHighlightColor = "rgba(128, 128, 255, 1)";
  var yellowHighlightColor = "rgba(255, 255, 128, 1)";
  var greenHighlightColor = "rgba(128, 255, 128, 1)";

  var orderedRowTypes;
  var totalNumColumns;

  function demoClear() {
    // Add nut dispensers
    var quarterRightTurns = [3, 2, 0, 3, 0, 0, 1, 2];
    placeElementOnBoard.placeBoxHolders(
      orderedRowTypes,
      totalNumColumns,
      quarterRightTurns
    );
    placeElementOnBoard.placeNutDispensers(
      orderedRowTypes,
      totalNumColumns,
      quarterRightTurns
    );

    // Salters and Roasters
    // Add Salters.
    var salterRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.Salter
    );
    placeElementOnBoard.placeMachineOnBoard(
      salterRowIndex,
      1,
      machineTypes.SalterMachine
    );
    placeElementOnBoard.placeMachineOnBoard(
      salterRowIndex,
      5,
      machineTypes.SalterMachine
    );

    // Add Roasters.
    var roasterRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.Roaster
    );
    placeElementOnBoard.placeMachineOnBoard(
      roasterRowIndex,
      3,
      machineTypes.RoasterMachine
    );
    placeElementOnBoard.placeMachineOnBoard(
      roasterRowIndex,
      6,
      machineTypes.RoasterMachine
    );

    // Add Squirrel.
    var squirrelRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.Squirrel
    );
    placeElementOnBoard.placeMarkerOnBoard(
      squirrelRowIndex,
      2,
      markerTypes.Squirrel
    );

    // Add conveyor tiles.
    // placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 6);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 1);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 3, 2);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 5, 6);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 7, 4);
    // placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 9, 1);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 9, 5, [
      "ghost",
    ]);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 10, 0);

    highlights.highlightConveyorTile(9, 5, gameUtils.blueHighlightColor);
    highlights.highlightAllConnectingPaths();
  }

  function demoBuildAndClear() {
    // Add nut dispensers
    var quarterRightTurns = [2, 2, 3, 2, 1, 0, 2, 3];
    placeElementOnBoard.placeBoxHolders(
      orderedRowTypes,
      totalNumColumns,
      quarterRightTurns
    );
    placeElementOnBoard.placeNutDispensers(
      orderedRowTypes,
      totalNumColumns,
      quarterRightTurns
    );

    // Salters and Roasters
    // Add Salters.
    var salterRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.Salter
    );
    placeElementOnBoard.placeMachineOnBoard(
      salterRowIndex,
      1,
      machineTypes.SalterMachine
    );
    placeElementOnBoard.placeMachineOnBoard(
      salterRowIndex,
      6,
      machineTypes.SalterMachine
    );

    // Add Roasters.
    var roasterRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.Roaster
    );
    placeElementOnBoard.placeMachineOnBoard(
      roasterRowIndex,
      2,
      machineTypes.RoasterMachine
    );
    placeElementOnBoard.placeMachineOnBoard(
      roasterRowIndex,
      5,
      machineTypes.RoasterMachine
    );

    // Add Squirrel.
    var squirrelRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.Squirrel
    );
    placeElementOnBoard.placeMarkerOnBoard(
      squirrelRowIndex,
      4,
      markerTypes.Squirrel
    );

    // Add conveyor tiles.
    // placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 6);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 5);
    placeConveyorTileOnBoard.placeConveyorTile(
      conveyorTileTypes.SplitterRight,
      5,
      1
    );
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 7, 4, [
      "ghost",
    ]);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 9, 5);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 10, 0);
    placeConveyorTileOnBoard.placeConveyorTile(
      conveyorTileTypes.JoinerRight,
      10,
      2
    );

    highlights.highlightConveyorTile(5, 1, gameUtils.blueHighlightColor);
    highlights.highlightConveyorTile(7, 4, gameUtils.redHighlightColor);

    highlights.highlightAllConnectingPaths(yellowHighlightColor);
  }

  addDemoConfig = function () {
    orderedRowTypes = versionDetails.getOrderedRowTypes();
    totalNumColumns = versionDetails.getTotalNumColumns();

    var configFunctions = [demoClear, demoBuildAndClear];
    // Set index to the one you want.
    var configIndex = 1;

    configFunctions[configIndex]();
  };

  return {
    addDemoConfig: addDemoConfig,
  };
});
