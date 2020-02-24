module.exports = {
  playerNameParam: {
    name: 'playerName',
    in: 'path',
    description: 'Username or non-dashed UUID of player. UUID should be used when feasible for better performance.',
    required: true,
    schema: {
      type: 'string',
    },
  },
  gameNameParam: {
    name: 'game',
    in: 'path',
    description: '[Standard](https://github.com/slothpixel/core/wiki/Standard-naming) minigame name',
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
    description: '`players`, `guilds` or `skyblock`',
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
  sortByParam: (required = true) => ({
    name: 'sortBy',
    in: 'query',
    description: 'Which stat to sort records by. Requires the full path when used with nested objects like stats.Arcade.wins',
    required,
    schema: {
      type: 'string',
    },
  }),
  sortOrderParam: {
    name: 'sortOrder',
    in: 'query',
    description: 'Define sort order. `asc` for ascending or `desc` for descending (default)',
    required: false,
    schema: {
      type: 'string',
    },
  },
  limitParam: {
    name: 'limit',
    in: 'query',
    description: 'Limit number of records returned. Default is 100 and maximum 1000.',
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
    description: 'Pages allow you to split the data using the `limit` param. For example, if there are 23 auctions matching your query and you set the limit to 10, each page will return up to the next 10 consecutive results. With 23 results, you would expect pages 0 and 1 to each have 20 results and page 2 to have the remaining 3.',
    required: false,
    schema: {
      type: 'integer',
    },
  },
  itemIdParam2: {
    name: 'id',
    in: 'query',
    description: 'Item id, e.g. HOT_POTATO_BOOK. All available item ids can be found on the [items endpoint](https://api.slothpixel.me/api/skyblock/items).',
    required: false,
    schema: {
      type: 'string',
    },
  },
  itemIdParam: {
    name: 'ItemId',
    in: 'path',
    description: 'Item id, e.g. HOT_POTATO_BOOK. All available item ids can be found on the [items endpoint](https://api.slothpixel.me/api/skyblock/items).',
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
  toParam: {
    name: 'to',
    in: 'query',
    description: 'Date to get auctions until to. Uses a Unix timestamp with milliseconds. E.g. to get past 24 hours, use Date.now() - 24 * 60 * 60 * 1000. Default is current date.',
    required: false,
    schema: {
      type: 'integer',
    },
  },
  profileIdParam: {
    name: 'profileId',
    in: 'path',
    description: 'SkyBlock profile id e.g. \'498228a732d443589aabd1e97e6806cd\' or profile name e.g. \'Mango\'. Note: profile name can be different (although unlikely) for different members of a co-op!',
    required: false,
    schema: {
      type: 'string',
    },
  },
};
