const utility = require('../util/utility');

function buildObject(boosters = []) {
  const obj = {};
  boosters.forEach((booster) => {
    const game = utility.IDToStandardName(booster.gameType);
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
      stacked: booster.stacked || [],
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
