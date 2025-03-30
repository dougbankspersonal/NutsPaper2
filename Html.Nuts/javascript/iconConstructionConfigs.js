define([
  "javascript/miscTypes",
  "javascript/nutTypes",

  "dojo/domReady!",
], function (miscTypes, nutTypes) {
  // This returned object becomes the defined value of this module
  return [
    {
      iconImage: nutTypes.Almond,
      borderColor: "#ff0000",
      color: "#bb6666",
    },
    {
      iconImage: nutTypes.Cashew,
      borderColor: "#ffff00",
      color: "#bbbb66",
    },
    {
      iconImage: nutTypes.Peanut,
      borderColor: "#0000ff",
      color: "#6666bb",
    },
    {
      iconImage: nutTypes.Pistachio,
      borderColor: "#00ff00",
      color: "#66bb66",
    },
    {
      iconImage: miscTypes.Salter,
      borderColor: "#dddddd",
      color: "#bbbbbb",
    },
    {
      iconImage: miscTypes.Roaster,
      borderColor: "#ffaa00",
      color: "#bb9966",
    },
  ];
});
