const { game_types: gameTypes, modes, maps } = require('hypixelconstants');

// Constant Values for maps and game types
const gameTypes_ = new Map(gameTypes
  .map(({ type_name: typeName, clean_name: cleanName }) => [typeName, cleanName]));
const maps_ = new Map(Object.entries(maps)
  .map(([game, maps]) => [game, new Map(Object.entries(maps).map((([map, { name }]) => [map, name])))]));

// Used for getting sub gamemodes
function getMode(type, mode){
	let gameObject = modes.find((modeObject) => modeObject.key === type);
	if (!gameObject) return mode
	let subGameObject = gameObject.modes.find(
		({key}) => key === "DREAMS" || key === "lab"
	);
	return modes_ = gameObject.modes.find(({key,keys}) =>
		keys ? keys.includes(mode) || key == mode : key == mode
	)
	|| subGameObject.modes.find(({key, keys}) =>
		keys ? keys.includes(mode) || key == mode : key == mode
	)
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
    mode: mode === 'LOBBY' ? 'Lobby' : (getMode(type, mode) ? getMode(type, mode).name || getMode(type, mode) : null),
    map: maps_.has(type) ? maps_.get(type).get(map) || null : map || null,
  },
});
