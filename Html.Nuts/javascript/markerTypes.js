define(["dojo/domReady!"], function () {
  var Squirrel = "Squirrel";

  var markerTypes = {
    Squirrel: Squirrel,
  };

  var orderedMarkerTypes = [];
  for (var markerType in markerTypes) {
    orderedMarkerTypes.push(markerTypes[markerType]);
  }

  return {
    Squirrel: Squirrel,
    orderedMarkerTypes: orderedMarkerTypes,
  };
});
