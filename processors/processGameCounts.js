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
    const cleanGame = toMode(rawGame, modes);
    if (data_.modes && Object.keys(data_.modes).length > 1) {
      const modes_ = {};
      for (const [rawMode, count] of Object.entries(data_.modes)) {
        const cleanMode = toMode(rawMode, modes);
        let modeCopy = rawMode;
        switch (modeCopy) {
          case 'PARTY':
            modes_[modeCopy] = {
              name: 'Party Games',
            };
            break;
          case 'TNTAG':
            modeCopy = 'TNTTAG';
            modes_[modeCopy] = {
              name: 'TNT Tag',
            };
            break;
          default:
            modes_[modeCopy] = {
              name: cleanMode,
            };
            break;
        }
        modes_[modeCopy].players = count;
      }
      object.games[rawGame] = {
        name: cleanGame,
        players: data_.players,
        modes: modes_,
      };
    } else {
      object.games[rawGame] = {
        name: cleanGame,
        players: data_.players,
      };
    }
    if (!cleanGame) delete object.games[rawGame].name;
  }
  object.playerCount = playerCount;
  return object;
}

module.exports = processGameCounts;
