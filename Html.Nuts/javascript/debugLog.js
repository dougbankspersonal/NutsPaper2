define([
	'dojo/domReady!'
], function(){
    var debugFlags = {
        "CardSize": "off",
        "ScoringTrack": "off",
        "GameBoard": "off",
        "ConveyorTiles": "off",
        "Score": "on",
    }

    function debugLog(flag, statement) {
        if (debugFlags[flag] == "on") {
            console.log(statement)
        }
    }

    return {
        debugLog: debugLog,
    };
});