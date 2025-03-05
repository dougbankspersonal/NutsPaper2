define([
  "dojo/dom",
  "dojo/dom-style",
  "javascript/gameUtils",
  "dojo/domReady!",
], function (dom, domStyle, gameUtils) {
  function addDieFace(pageOfItems, opt_styleDescs) {
    var dieFace = htmlUtils.addDiv(pageOfItems, ["dieFace"], "dieFace");
    domStyle.set(dieFace, {
      height: gameUtils.dieHeight + "px",
      width: gameUtils.dieWidth + "px",
    });

    if (opt_styleDescs) {
      for (var styleDesc of opt_styleDescs) {
        var image = htmlUtils.addImage(
          dieFace,
          ["dieImage"],
          "dieImage",
          styleDesc.img
        );
        domStyle.set(image, styleDesc);
      }
    }
    return dieFace;
  }

  var huntImage = "../images/Dice/hunt.png";
  var scamperImage = "../images/Dice/scamper.png";
  var stopImage = "../images/Dice/stop.png";
  var rollImage = "../images/Dice/roll.png";

  function createDieTemplate() {
    var bodyNode = dom.byId("body");

    var scale = 0.9;

    var pageOfItems = htmlUtils.addPageOfItems(bodyNode);
    for (var i = 0; i < 3; i++) {
      addDieFace(pageOfItems);
    }
    for (var i = 0; i < 1; i++) {
      addDieFace(pageOfItems, [
        {
          img: scamperImage,
          transform: `scale(${scale})`,
          "max-width": `${scale * 100}%`,
        },
      ]);
    }
    for (var i = 0; i < 3; i++) {
      addDieFace(pageOfItems, [
        {
          img: stopImage,
          "max-width": `100%`,
        },
      ]);
    }

    addDieFace(pageOfItems, [
      {
        img: huntImage,
        transform: `scale(${scale})`,
        "max-width": `${scale * 100}%`,
      },
    ]);
    addDieFace(pageOfItems, [
      {
        img: huntImage,
        transform: `scale(${scale}) translateY(15%)`,
        "max-width": `${scale * 100}%`,
        "z-index": 2,
      },
      {
        img: rollImage,
        transform: `scale(${scale}) translateY(-15%)`,
        "max-width": `${scale * 100}%`,
        "z-index": 1,
      },
    ]);
  }
  return {
    createDieTemplate: createDieTemplate,
  };
});
