define(["dojo/domReady!"], function () {
  var CrossBar = "CrossBar";
  var OpenBox = "OpenBox";
  var ClosedBox = "ClosedBox";
  var Salter = "Salter";
  var Roaster = "Roaster";

  var orderedMiscTypes = [CrossBar, OpenBox, ClosedBox, Salter, Roaster];

  return {
    CrossBar: CrossBar,
    OpenBox: OpenBox,
    ClosedBox: ClosedBox,
    Salter: Salter,
    Roaster: Roaster,

    orderedMiscTypes: orderedMiscTypes,
  };
});
