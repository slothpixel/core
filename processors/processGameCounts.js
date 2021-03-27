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
  for (const [game, data_] of Object.entries(games_)) {
    let cleanName = toMode(game.replace(/_LOBBY/, ''), modes) || game;
    cleanName = cleanName.split(' ').join('');
    if (data_.modes && Object.keys(data_.modes).length > 1) {
      const modes_ = {};
      for (const [mode, count] of Object.entries(data_.modes)) {
        let cleanMode = toMode(mode, modes) || mode;
        cleanMode = cleanMode.split(' ').join('');
        modes_[cleanMode] = count;
      }
      object.games[cleanName] = {
        players: data_.players,
        modes: modes_,
      };
    } else {
      object.games[cleanName] = {
        players: data_.players,
      };
    }
  }
  object.playerCount = playerCount;
  return object;
}

module.exports = processGameCounts;
