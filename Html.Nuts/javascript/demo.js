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
  var orderedRowTypes;
  var totalNumColumns;

  function doStandardBoardSetup(quarterRightTurns, opt_options) {
    var options = opt_options || {};

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
    var salter1Column = options.salter1Column || 3;
    placeElementOnBoard.placeMachineOnBoard(
      salterRowIndex,
      salter1Column,
      machineTypes.SalterMachine
    );
    var salter2Column = options.salter2Column || 6;
    placeElementOnBoard.placeMachineOnBoard(
      salterRowIndex,
      salter2Column,
      machineTypes.SalterMachine
    );

    // Add Roasters.
    var roasterRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.Roaster
    );
    var roaster1Column = options.roaster1Column || 2;
    placeElementOnBoard.placeMachineOnBoard(
      roasterRowIndex,
      roaster1Column,
      machineTypes.RoasterMachine
    );
    var roaster2Column = options.roaster2Column || 5;
    placeElementOnBoard.placeMachineOnBoard(
      roasterRowIndex,
      roaster2Column,
      machineTypes.RoasterMachine
    );

    // Add Squirrel.
    var squirrelRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.Squirrel
    );
    var squirrelColumn = options.squirrelColumn || 4;
    placeElementOnBoard.placeMarkerOnBoard(
      squirrelRowIndex,
      squirrelColumn,
      markerTypes.Squirrel
    );
  }

  function demoBuildAndClear() {
    // Add nut dispensers
    var quarterRightTurns = [2, 2, 0, 3, 3, 0, 2, 3];

    doStandardBoardSetup(quarterRightTurns);

    // Add conveyor tiles.
    // placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 6);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 5);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 5, 1);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 7, 4, [
      "ghost",
    ]);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 9, 5);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 10, 0);
    highlights.highlightConveyorTile(5, 1, gameUtils.blueHighlightColor);
    highlights.highlightConveyorTile(7, 4, gameUtils.redHighlightColor);

    highlights.highlightAllConnectingPaths(gameUtils.yellowHighlightColor);
  }

  function demoSplitterJoiner() {
    // Add nut dispensers
    var quarterRightTurns = [2, 2, 0, 3, 3, 2, 2, 3];

    doStandardBoardSetup(quarterRightTurns);

    // Add conveyor tiles.
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 2);
    placeConveyorTileOnBoard.placeConveyorTile(
      conveyorTileTypes.SplitterRight,
      2,
      5
    );
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 3, 4);
    placeConveyorTileOnBoard.placeConveyorTile(
      conveyorTileTypes.JoinerRight,
      5,
      3
    );
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 7, 4);
    placeConveyorTileOnBoard.placeConveyorTile(
      conveyorTileTypes.JoinerLeft,
      9,
      5
    );
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 10, 0);

    highlights.highlightAllConnectingPaths(gameUtils.yellowHighlightColor);
  }

  function demoProduction() {
    // Add nut dispensers
    var quarterRightTurns = [0, 1, 1, 3, 1, 1, 2, 3];

    doStandardBoardSetup(quarterRightTurns, {
      squirrelColumn: 3,
      salter1Column: 2,
    });

    // Add conveyor tiles.
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 0);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 3, 2);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 4, 4);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 7, 6);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 10, 3);

    highlights.highlightAllConnectingPaths(gameUtils.yellowHighlightColor);
  }

  addDemoConfig = function () {
    orderedRowTypes = versionDetails.getOrderedRowTypes();
    totalNumColumns = versionDetails.getTotalNumColumns();

    var configFunctions = [
      demoBuildAndClear,
      demoSplitterJoiner,
      demoProduction,
    ];
    // Set index to the one you want.
    var configIndex = 0;

    configFunctions[configIndex]();
  };

  return {
    addDemoConfig: addDemoConfig,
  };
});
