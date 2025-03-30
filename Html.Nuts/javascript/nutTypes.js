define(["dojo/domReady!"], function () {
  var Almond = "Almond";
  var Cashew = "Cashew";
  var Peanut = "Peanut";
  var Pistachio = "Pistachio";

  var orderedNutTypes = [Almond, Cashew, Peanut, Pistachio];

  return {
    Almond: Almond,
    Cashew: Cashew,
    Peanut: Peanut,
    Pistachio: Pistachio,

    orderedNutTypes: orderedNutTypes,
    numNutTypes: orderedNutTypes.length,
  };
});
