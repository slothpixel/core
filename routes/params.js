module.exports = {
  playerNameParam: {
    name: 'playerName',
    in: 'path',
    description: 'Username or non-dashed uuid of player',
    required: true,
    schema: {
      type: 'string',
    },
  },
  gameNameParam: {
    name: 'game',
    in: 'path',
    description: 'Standard minigame name',
    required: true,
    schema: {
      type: 'string',
    },
  },
};
