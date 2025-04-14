define([
  "dojo/dom",
  "dojo/dom-style",
  "sharedJavascript/debugLog",
  "sharedJavascript/genericUtils",
  "javascript/boxHolders",
  "javascript/gameUtils",
  "javascript/highlights",
  "javascript/machines",
  "javascript/machineTypes",
  "javascript/markers",
  "javascript/rowTypes",
  "dojo/domReady!",
], function (
  dom,
  domStyle,
  debugLog,
  genericUtils,
  boxHolders,
  gameUtils,
  highlights,
  machines,
  machineTypes,
  markers,
  rowTypes
) {
  function fixupMarkerStyling(marker) {
    var style = {};
    style["margin"] = "0px";
    style["position"] = "absolute";
    domStyle.set(marker, style);
  }

  // columnnIndex is 0-based, ignoring the sidebar.
  function placeMarkerOnBoard(
    rowIndex,
    columnIndex,
    markerType,
    opt_classArray,
    opt_additionalConfig
  ) {
    debugLog.debugLog(
      "Markers",
      "Doug: placeMarkerOnBoard rowIndex = " + rowIndex
    );
    debugLog.debugLog(
      "Markers",
      "Doug: placeMarkerOnBoard columnIndex = " + columnIndex
    );
    var rowId = gameUtils.getRowId(rowIndex);
    var rowNode = dom.byId(rowId);
    console.assert(rowNode, "Doug: rowNode is null");
    var elementNode = gameUtils.getElementFromRow(rowNode, columnIndex);
    console.assert(elementNode, "Doug: elementNode is null");
    // add marker here.
    var marker = markers.addMarker(
      elementNode,
      markerType,
      opt_classArray,
      opt_additionalConfig
    );
    debugLog.debugLog("Markers", "Doug: placeMarkerOnBoard marker = " + marker);
    fixupMarkerStyling(marker);
    return marker;
  }

  function fixupMachineStyling(machine) {
    var style = {};
    style["margin"] = "0px";
    style["position"] = "absolute";
    domStyle.set(machine, style);
  }

  // columnnIndex is 0-based, ignoring the sidebar.
  function placeMachineOnBoard(rowIndex, columnIndex, machineType) {
    var rowId = gameUtils.getRowId(rowIndex);
    var rowNode = dom.byId(rowId);
    debugLog.debugLog(
      "Machines",
      "Doug: placeMachineOnBoard rowNode = " + rowNode
    );
    // add a machine to this element.
    var elementNode = gameUtils.getElementFromRow(rowNode, columnIndex);
    debugLog.debugLog(
      "Machines",
      "Doug: placeMachineOnBoard elementNode = " + elementNode
    );
    // add machine here.
    var machine = machines.addMachine(elementNode, machineType);
    debugLog.debugLog(
      "Machines",
      "Doug: placeMachineOnBoard machine = " + machine
    );
    fixupMachineStyling(machine);
    return machine;
  }

  function addBoxHolderWithNumQuarterRightTurns(
    rowIndex,
    columnIndex,
    numQuarterRightTurns,
    opt_classArray
  ) {
    var boxHoldersRowId = gameUtils.getRowId(rowIndex);
    var boxHoldersRow = dom.byId(boxHoldersRowId);
    var element = gameUtils.getElementFromRow(boxHoldersRow, columnIndex);

    // add an order card to this element.
    var card = boxHolders.addBoxHolderCard(
      element,
      columnIndex,
      opt_classArray
    );

    debugLog.debugLog(
      "GameBoard",
      "Doug: addBoxHolderWithNumQuarterRightTurns columnIndex = " + columnIndex
    );

    debugLog.debugLog(
      "GameBoard",
      "Doug: addBoxHolderWithNumQuarterRightTurns final numQuarterRightTurns = " +
        numQuarterRightTurns
    );

    boxHolders.setQuarterRightTurns(card, numQuarterRightTurns);
    // Have highlight code note who's on top.
    // Record the type of nut on top of the box holder.
    highlights.storeTopBoxNutType(columnIndex, numQuarterRightTurns);

    return card;
  }

  function addBoxHolderNotMatching(
    rowIndex,
    columnIndex,
    nutType,
    opt_classArray
  ) {
    // Start with some random index.
    var numQuarterRightTurns = (columnIndex * columnIndex) % 4;
    debugLog.debugLog(
      "GameBoard",
      "Doug: addBoxHolderNotMatching numQuarterRightTurns = " +
        numQuarterRightTurns
    );

    // Now spin until the top nut is notNutType.
    var originalTopNutType = boxHolders.getTopNutType(columnIndex, 0);
    debugLog.debugLog(
      "GameBoard",
      "Doug: addBoxHolderNotMatching originalTopNutType = " + originalTopNutType
    );
    var newTopNutType = boxHolders.getTopNutType(
      columnIndex,
      numQuarterRightTurns
    );
    debugLog.debugLog(
      "GameBoard",
      "Doug: addBoxHolderNotMatching newTopNutType = " + newTopNutType
    );

    while (
      boxHolders.getTopNutType(columnIndex, numQuarterRightTurns) == nutType
    ) {
      numQuarterRightTurns++;
      numQuarterRightTurns = numQuarterRightTurns % 4;
    }

    var card = addBoxHolderWithNumQuarterRightTurns(
      rowIndex,
      columnIndex,
      numQuarterRightTurns,
      opt_classArray
    );

    return card;
  }

  function placeNutDispensers(orderedRowTypes, totalNumColumns) {
    // Add nut dispensers
    var dispenserRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.Dispenser
    );

    var numNutMachineTypes = machineTypes.orderedNutMachineTypes.length;
    for (var i = 0; i < totalNumColumns; i++) {
      var machineType =
        machineTypes.orderedNutMachineTypes[i % numNutMachineTypes];
      placeMachineOnBoard(dispenserRowIndex, i, machineType);
    }
  }

  function placeBoxHolders(
    orderedRowTypes,
    totalNumColumns,
    opt_numQuarterRightTurns
  ) {
    debugLog.debugLog(
      "Machines",
      "Doug: placeBoxHolders orderedRowTypes = " +
        JSON.stringify(orderedRowTypes)
    );
    debugLog.debugLog(
      "Machines",
      "Doug: placeBoxHolders totalNumColumns = " +
        JSON.stringify(totalNumColumns)
    );
    debugLog.debugLog(
      "Machines",
      "Doug: placeBoxHolders opt_numQuarterRightTurns = " +
        JSON.stringify(opt_numQuarterRightTurns)
    );
    var boxHolderRowIndex = genericUtils.getIndexOfFirstInstanceInArray(
      orderedRowTypes,
      rowTypes.BoxHolders
    );

    var numNutMachineTypes = machineTypes.orderedNutMachineTypes.length;
    for (var i = 0; i < totalNumColumns; i++) {
      if (opt_numQuarterRightTurns) {
        console.assert(
          opt_numQuarterRightTurns.length == totalNumColumns,
          "should match"
        );
        var numQuarterRightTurns = opt_numQuarterRightTurns[i];
        addBoxHolderWithNumQuarterRightTurns(
          boxHolderRowIndex,
          i,
          numQuarterRightTurns
        );
      } else {
        var machineType =
          machineTypes.orderedNutMachineTypes[i % numNutMachineTypes];
        addBoxHolderNotMatching(boxHolderRowIndex, i, machineType);
      }
    }
  }

  // This returned object becomes the defined value of this module
  return {
    placeMarkerOnBoard: placeMarkerOnBoard,
    placeMachineOnBoard: placeMachineOnBoard,
    placeNutDispensers: placeNutDispensers,
    placeBoxHolders: placeBoxHolders,
  };
});
