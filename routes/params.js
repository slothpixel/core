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
  cachedParam: {
    name: 'cached',
    in: 'query',
    description: 'Whether to use cached data when available',
    required: false,
    schema: {
      type: 'string',
    },
  },
  typeParam: {
    name: 'type',
    in: 'query',
    description: '"players" or "guilds"',
    required: true,
    schema: {
      type: 'string',
    },
  },
  columnParam: {
    name: 'columns',
    in: 'query',
    description: 'Choose which data columns will be returned e.g. stats.Arcade.coins',
    required: true,
    schema: {
      type: 'string',
    },
  },
  sortByParam: {
    name: 'sortBy',
    in: 'query',
    description: 'Which stat to sort records by',
    required: true,
    schema: {
      type: 'string',
    },
  },
  limitParam: {
    name: 'limit',
    in: 'query',
    description: 'Limit number of records returned. Default is 10.',
    required: false,
    schema: {
      type: 'string',
    },
  },
  filterParam: {
    name: 'filter',
    in: 'query',
    description: 'Filter entries by passing MongoDB query filter object as JSON string',
    required: false,
    schema: {
      type: 'string',
    },
  },
  significantParam: {
    name: 'significant',
    in: 'query',
    description: 'Set to "false" to also return admin accounts. "true" by default.',
    required: false,
    schema: {
      type: 'boolean',
    },
  },
};
