define(["sharedJavascript/dieUtils", "dojo/domReady!"], function (dieUtils) {
  var huntImage = "../images/Dice/hunt.png";
  var scamperImage = "../images/Dice/scamper.png";
  var stopImage = "../images/Dice/stop.png";
  var rollImage = "../images/Dice/roll.png";

  var scale = 0.9;

  function addStopFace(parent) {
    return dieUtils.addDieFace(parent, [
      {
        img: stopImage,
        "max-width": `100%`,
      },
    ]);
  }

  function addScamperFace(parent) {
    return dieUtils.addDieFace(parent, [
      {
        img: scamperImage,
        transform: `scale(${scale})`,
        "max-width": `${scale * 100}%`,
      },
    ]);
  }

  function addHuntFace(parent) {
    return dieUtils.addDieFace(parent, [
      {
        img: huntImage,
        transform: `scale(${scale})`,
        "max-width": `${scale * 100}%`,
      },
    ]);
  }

  function addHuntAndRollFace(parent) {
    var imageOffset = 15;
    return dieUtils.addDieFace(parent, [
      {
        img: rollImage,
        transform: `scale(${scale}) translateY(${-imageOffset}%)`,
        "max-width": `${scale * 100}%`,
        "z-index": 1,
        position: "absolute",
      },
      {
        img: huntImage,
        transform: `scale(${scale}) translateY(${imageOffset}%)`,
        "max-width": `${scale * 100}%`,
        "z-index": 2,
        position: "absolute",
      },
    ]);
  }

  function addNthFace(parent, index) {
    if (index < 3) {
      return addStopFace(parent);
    }
    if (index < 4) {
      return addScamperFace(parent);
    }
    if (index < 5) {
      return addHuntFace(parent);
    }
    return addHuntAndRollFace(parent);
  }

  return {
    addNthFace: addNthFace,
  };
});
