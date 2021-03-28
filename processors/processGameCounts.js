/* eslint-disable consistent-return */
const { modes } = require('hypixelconstants');

function toMode(name, array) {
  if (array) {
    for (const item of array) {
      if (item.key.toLowerCase() === name.toLowerCase()) return item.name;
      const found = toMode(name, item.modes);
      if (found) return found;
    }
  }
}

function processGameCounts(data) {
  const object = {
    games: {},
  };
  const { games: games_, playerCount } = data;
  for (const [rawGame, data_] of Object.entries(games_)) {
    const cleanGame = toMode(rawGame.replace(/_LOBBY/, ''), modes) || rawGame;
    if (data_.modes && Object.keys(data_.modes).length > 1) {
      const modes_ = {};
      for (const [rawMode, count] of Object.entries(data_.modes)) {
        const cleanMode = toMode(rawMode, modes) || rawMode;
        modes_[rawMode] = {};
        if (cleanMode !== rawMode) {
          modes_[rawMode].name = cleanMode;
        }
        modes_[rawMode].players = count;
      }
      object.games[rawGame] = {};
      if (cleanGame !== rawGame) {
        object.games[rawGame].name = cleanGame;
      }
      object.games[rawGame].players = data_.players;
      object.games[rawGame].modes = modes_;
    } else {
      object.games[rawGame] = {};
      if (cleanGame !== rawGame) {
        object.games[rawGame].name = cleanGame;
      }
      object.games[rawGame].players = data_.players;
    }
  }
  object.playerCount = playerCount;
  return object;
}

module.exports = processGameCounts;
