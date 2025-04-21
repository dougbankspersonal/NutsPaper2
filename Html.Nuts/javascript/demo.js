define([
  "dojo/dom-style",
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
  domStyle,
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
    var quarterRightTurns = [2, 2, 1, 1, 0, 0, 2, 2];

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

    highlights.highlightConveyorTile(5, 1, gameUtils.blueHighlightColor);
  }

  function demoKeyConcepts() {
    var quarterRightTurns = [2, 2, 3, 1, 0, 0, 0, 2];

    doStandardBoardSetup(quarterRightTurns, {});

    // Add conveyor tiles.
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 5);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 5, 1);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 7, 4);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 9, 5);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 10, 0);

    highlights.highlightAllConnectingPaths(gameUtils.yellowHighlightColor);
  }

  function demoProduction() {
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

  function demoSlideAndSpin() {
    var quarterRightTurns = [3, 2, 0, 0, 3, 1, 1, 2];

    doStandardBoardSetup(quarterRightTurns, {
      squirrelColumn: 2,
      salter1Column: 1,
      salter2Column: 5,
      roaster1Column: 3,
      roaster2Column: 6,
    });

    // Add conveyor tiles.
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 1);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 5, 6);
    var tile = placeConveyorTileOnBoard.placeConveyorTile(
      conveyorTileTypes.Cross,
      7,
      3
    );
    domStyle.set(tile, {
      "z-index": 10,
    });
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 7, 4, [
      "ghost",
    ]);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 10, 0);

    highlights.highlightAllConnectingPaths(gameUtils.yellowHighlightColor);
    highlights.highlightConveyorTile(7, 3, gameUtils.blueHighlightColor);
    highlights.highlightBoxHolder(6, gameUtils.greenHighlightColor);
  }

  function demoSquirrel() {
    var quarterRightTurns = [2, 2, 0, 1, 3, 0, 2, 2];

    doStandardBoardSetup(quarterRightTurns, {
      squirrelColumn: 1,
      salter1Column: 1,
      salter2Column: 5,
      roaster1Column: 3,
      roaster2Column: 6,
    });

    // Add conveyor tiles.
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 2, 1);
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 5, 6);
    var tile = placeConveyorTileOnBoard.placeConveyorTile(
      conveyorTileTypes.Cross,
      7,
      3
    );
    placeConveyorTileOnBoard.placeConveyorTile(conveyorTileTypes.Cross, 10, 0);
    placeElementOnBoard.placeMarkerOnBoard(6, 2, markerTypes.Squirrel, [
      "ghost",
    ]);

    highlights.highlightAllConnectingPaths(gameUtils.yellowHighlightColor);
    var slot = gameUtils.getSlot(6, 1);
    highlights.highlightQueryResult(
      slot,
      ".marker",
      gameUtils.blueHighlightColor
    );
  }

  addDemoConfig = function () {
    orderedRowTypes = versionDetails.getOrderedRowTypes();
    totalNumColumns = versionDetails.getTotalNumColumns();

    var configFunctions = [
      demoKeyConcepts,
      demoBuildAndClear,
      demoSlideAndSpin,
      demoSquirrel,
      demoProduction,
      demoSplitterJoiner,
    ];

    demoSplitterJoiner();
  };

  return {
    addDemoConfig: addDemoConfig,
  };
});
