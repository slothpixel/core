const { IDToStandardName, removeDashes } = require('../util/utility');

function buildObject(boosters = []) {
  const obj = {};
  function getStackedArray(stacked = []) {
    if (!Array.isArray(stacked)) stacked = [];
    return stacked.map((uuid) => removeDashes(uuid));
  }
  boosters.forEach((booster) => {
    const game = IDToStandardName(booster.gameType);
    if (!Object.hasOwnProperty.call(obj, game)) {
      obj[game] = [];
    }
    obj[game].push({
      uuid: booster.purchaserUuid,
      multiplier: booster.amount,
      activated: booster.dateActivated,
      original_length: booster.originalLength,
      length: booster.length,
      active: (booster.length < booster.originalLength),
      stacked: getStackedArray(booster.stacked),
    });
  });
  return obj;
}

function processBoosters(data = {}) {
  return {
    boosters: buildObject(data.boosters),
    decrementing: data.boosterState.decrementing,
  };
}

module.exports = processBoosters;
