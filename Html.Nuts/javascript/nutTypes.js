define(["dojo/domReady!"], function () {
  var nutTypeAlmond = "Almond";
  var nutTypeCashew = "Cashew";
  var nutTypePeanut = "Peanut";
  var nutTypePistachio = "Pistachio";

  var nutTypes = [
    nutTypeAlmond,
    nutTypeCashew,
    nutTypePeanut,
    nutTypePistachio,
  ];
  return {
    nutTypeAlmond: nutTypeAlmond,
    nutTypeCashew: nutTypeCashew,
    nutTypePeanut: nutTypePeanut,
    nutTypePistachio: nutTypePistachio,

    nutTypes: nutTypes,
    numNutTypes: nutTypes.length,
  };
});
