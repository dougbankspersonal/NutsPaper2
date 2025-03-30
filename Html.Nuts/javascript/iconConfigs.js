define([
  "javascript/machineTypes",
  "javascript/nutTypes",

  "dojo/domReady!",
], function (machineTypes, nutTypes) {
  // This returned object becomes the defined value of this module
  return [
    {
      iconType: nutTypes.Almond,
      borderColor: "#ff0000",
      color: "#bb6666",
    },
    {
      iconType: nutTypes.Cashew,
      borderColor: "#ffff00",
      color: "#bbbb66",
    },
    {
      iconType: nutTypes.Peanut,
      borderColor: "#0000ff",
      color: "#6666bb",
    },
    {
      iconType: nutTypes.Pistachio,
      borderColor: "#00ff00",
      color: "#66bb66",
    },
    {
      iconType: machineTypes.Salter,
      borderColor: "#dddddd",
      color: "#bbbbbb",
    },
    {
      iconType: machineTypes.Roaster,
      borderColor: "#ffaa00",
      color: "#bb9966",
    },
  ];
});
