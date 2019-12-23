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
  populatePlayersParam: {
    name: 'populatePlayers',
    in: 'query',
    description: 'Replace uuid fields with player profiles',
    required: false,
    schema: {
      type: 'string',
    },
  },
  templateParam: {
    name: 'template',
    in: 'path',
    description: '',
    required: true,
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
  itemIdParam: {
    name: 'ItemId',
    in: 'path',
    description: 'Item id, e.g. HOT_POTATO_BOOK',
    required: true,
    schema: {
      type: 'string',
    },
  },
  fromParam: {
    name: 'from',
    in: 'query',
    description: 'Date from which to get auctions. Uses a Unix timestamp with milliseconds. E.g. to get past 24 hours, use Date.now() - 24 * 60 * 60 * 1000.',
    required: true,
    schema: {
      type: 'integer',
    },
  },
};
