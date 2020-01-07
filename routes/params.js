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
    description: 'Choose which data columns will be returned e.g. stats.Arcade.coins. Multiple columns are separated with commas.',
    required: true,
    schema: {
      type: 'string',
    },
  },
  sortByParam: {
    name: 'sortBy',
    in: 'query',
    description: 'Which stat to sort records by. Requires the full path when using with nested objects like stats.Arcade.wins',
    required: true,
    schema: {
      type: 'string',
    },
  },
  limitParam: {
    name: 'limit',
    in: 'query',
    description: 'Limit number of records returned. Default is 10 and maximum 1000.',
    required: false,
    schema: {
      type: 'integer',
    },
  },
  filterParam: {
    name: 'filter',
    in: 'query',
    description: 'Filter entries by passing [MongoDB query](https://docs.mongodb.com/manual/reference/operator/query/) filter object as URL encoded JSON string. [Example usage](https://github.com/slothpixel/core/wiki/Using-MongoDB-filters-with-the-Slothpixel-API)',
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
  auctionUUIDParam: {
    name: 'auctionUUID',
    in: 'query',
    description: 'Auction uuid, e.g. "7314f4f14c324342933e6c8c46a600be"',
    required: false,
    schema: {
      type: 'string',
    },
  },
  itemUUIDParam: {
    name: 'itemUUID',
    in: 'query',
    description: 'Item uuid, e.g. "b8b9b051-e17f-4eb8-8b57-0a41a7d8eb72"',
    required: false,
    schema: {
      type: 'string',
    },
  },
  activeParam: {
    name: 'active',
    in: 'query',
    description: 'Set to false if you want to query historical auctions',
    required: false,
    schema: {
      type: 'boolean',
    },
  },
  pageParam: {
    name: 'page',
    in: 'query',
    description: 'Pages allow you to split data with the "limit" param. For example if there are 23 auctions matching you query and you se limit to 10, pages 0 and 1 will return 10 results and the third page 3.',
    required: false,
    schema: {
      type: 'integer',
    },
  },
  itemIdParam2: {
    name: 'id',
    in: 'query',
    description: 'Item id, e.g. HOT_POTATO_BOOK',
    required: false,
    schema: {
      type: 'string',
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
    description: 'Date from which to get auctions. Uses a Unix timestamp with milliseconds. E.g. to get past 24 hours, use Date.now() - 24 * 60 * 60 * 1000. Default is from past 24 hours.',
    required: false,
    schema: {
      type: 'integer',
    },
  },
  untilParam: {
    name: 'until',
    in: 'query',
    description: 'Date to get auctions until to. Uses a Unix timestamp with milliseconds. E.g. to get past 24 hours, use Date.now() - 24 * 60 * 60 * 1000. Default is current date.',
    required: false,
    schema: {
      type: 'integer',
    },
  },
};
