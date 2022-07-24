const { game_types: gameTypes, modes, maps } = require('hypixelconstants');

const gameTypes_ = new Map(gameTypes
  .map(({ type_name: typeName, clean_name: cleanName }) => [typeName, cleanName]));
const maps_ = new Map(Object.entries(maps)
  .map(([game, maps]) => [game, new Map(Object.entries(maps).map((([map, { name }]) => [map, name])))]));

function getMode(type, mode) {
  const game = modes.find(({ key }) => key === type);
  if (!game) return mode;
  const subGame = game.modes.find(
    ({ key }) => key === 'DREAMS' || key === 'lab',
  );
  return game.modes.find(({ key, keys }) => (keys && keys.includes(mode)) || key === mode)
  || (subGame && subGame.modes.find(({ key, keys }) => (keys && keys.includes(mode)) || key === mode));
}

module.exports = ({
  online,
  gameType: type,
  mode,
  map,
}) => ({
  online,
  game: {
    type: gameTypes_.get(type) || null,
    // eslint-disable-next-line no-nested-ternary
    mode: mode === 'LOBBY' ? 'Lobby' : (getMode(type, mode) ? getMode(type, mode).name || getMode(type, mode) : null),
    map: maps_.has(type) ? maps_.get(type).get(map) || null : map || null,
  },
});
