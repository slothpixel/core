const { IDToStandardName, removeDashes } = require('../util/utility');

function getStackedArray(stacked = []) {
  if (!Array.isArray(stacked)) stacked = [];
  return stacked.map((uuid) => removeDashes(uuid));
}

function buildObject(boosters = []) {
  const object = {};
  boosters.forEach((booster) => {
    const game = IDToStandardName(booster.gameType);
    if (!Object.hasOwnProperty.call(object, game)) {
      object[game] = [];
    }
    object[game].push({
      uuid: booster.purchaserUuid,
      multiplier: booster.amount,
      activated: booster.dateActivated,
      original_length: booster.originalLength,
      length: booster.length,
      active: (booster.length < booster.originalLength),
      stacked: getStackedArray(booster.stacked),
    });
  });
  return object;
}

function processBoosters(data = {}) {
  return {
    boosters: buildObject(data.boosters),
    decrementing: data.boosterState.decrementing,
  };
}

module.exports = processBoosters;
