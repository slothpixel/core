const { game_types: gameTypes, modes, maps } = require('hypixelconstants');

const gameTypes_ = new Map(gameTypes
  .map(({ type_name: typeName, clean_name: cleanName }) => [typeName, cleanName]));
const modes_ = new Map(modes
  .map(({ key, modes }) => [key, modes])
  .filter(([_, modes]) => modes)
  .map(([key, modes]) => [key, new Map(modes.map(({ key, name }) => [key, name]))]));
const maps_ = new Map(Object.entries(maps)
  .map(([game, maps]) => [game, new Map(Object.entries(maps).map((([map, { name }]) => [map, name])))]));

module.exports = ({
  online,
  gameType: type,
  mode,
  map,
}) => ({
  online,
  game: {
    type: gameTypes_.get(type) || null,
    mode: mode === 'LOBBY' ? 'Lobby' : (modes_.has(type) ? modes_.get(type).get(mode) || null : null),
    map: maps_.has(type) ? maps_.get(type).get(map) || null : map || null,
  },
});
