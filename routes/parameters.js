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
  guildNameParam: {
    name: 'guildName',
    in: 'path',
    description: 'Name of guild.',
    required: true,
    schema: {
      type: 'string',
    },
  },
  guildIDParam: {
    name: 'guildID',
    in: 'path',
    description: 'ID of guild.',
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
      enum: [
        'players',
        'guilds',
        'skyblock',
      ],
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
    description: 'Which stat to sort records by. Requires the full path when used with nested objects like stats.Arcade.wins',
    required: true,
    schema: {
      type: 'string',
    },
  },
  sortOrderParam: {
    name: 'sortOrder',
    in: 'query',
    description: 'Define sort order. `asc` for ascending or `desc` for descending',
    required: false,
    schema: {
      type: 'enum',
      default: 'desc',
      enum: [
        'desc',
        'asc',
      ],
    },
  },
  limitParam: {
    name: 'limit',
    in: 'query',
    description: 'Limit number of records returned. Largest allowed value is 1000.',
    required: false,
    schema: {
      type: 'integer',
      default: 1000,
    },
  },
  filterParam: {
    name: 'filter',
    in: 'query',
    description: 'Filter entries by passing [MongoDB query](https://docs.mongodb.com/manual/reference/operator/query/) filter object as URL encoded JSON string. [Example usage](https://github.com/slothpixel/core/wiki/Using-MongoDB-filters-with-the-Slothpixel-API)',
    required: false,
    deprecated: true,
    schema: {
      type: 'string',
    },
  },
  significantParam: {
    name: 'significant',
    in: 'query',
    description: 'Set to "false" to also return admin accounts.',
    required: false,
    schema: {
      type: 'boolean',
      default: true,
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
  bazaarItemIdParam: {
    name: 'itemId',
    in: 'path',
    description: 'Item id, e.g. HOT_POTATO_BOOK. All available item ids can be found on the [items endpoint](https://api.slothpixel.me/api/skyblock/items). Multiple can be specified by seperating them with commas. To get all the items, don\'t specify itemId.',
    required: false,
    schema: {
      type: 'string',
    },
  },
  fromParam: {
    name: 'from',
    in: 'query',
    description: 'Date from which to get auctions. Uses a Unix timestamp with milliseconds or a [custom date string](https://github.com/slothpixel/core/wiki/Using-custom-date-parameters). E.g. to get past 24 hours, use `now-1d`.',
    default: 'now-d',
    required: false,
    schema: {
      type: 'string',
    },
  },
  toParam: {
    name: 'to',
    in: 'query',
    description: 'Date to get auctions until to. Uses a Unix timestamp with milliseconds or a [custom date string](https://github.com/slothpixel/core/wiki/Using-custom-date-parameters). E.g. to reference the date 3 hours ago, use `now-3h`',
    default: 'now',
    required: false,
    schema: {
      type: 'string',
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
  calendarEventsParam: {
    name: 'events',
    in: 'query',
    description: 'The specific events you want to view the times. If left blank, will return all events. Multiple events separated by commas.',
    required: false,
    schema: {
      type: 'string',
    },
  },
  calendarFromParam: {
    name: 'from',
    in: 'query',
    description: 'Date from which to get events. Uses a Unix timestamp with milliseconds or a [custom date string](https://github.com/slothpixel/core/wiki/Using-custom-date-parameters). E.g. to get past 24 hours, use `now-1d`.',
    required: false,
    default: 'now',
    schema: {
      type: 'string',
    },
  },
  calendarToParam: {
    name: 'to',
    in: 'query',
    description: 'Date to get calendar events until to. Uses a Unix timestamp with milliseconds or a [custom date string](https://github.com/slothpixel/core/wiki/Using-custom-date-parameters). E.g. to reference the date 3 hours ago, use `now-3h`.',
    required: false,
    default: 'now',
    schema: {
      type: 'string',
    },
  },
  calendarYearsParam: {
    name: 'years',
    in: 'query',
    description: 'The amount of Skyblock years to query.',
    required: false,
    schema: {
      type: 'integer',
    },
  },
  calendarStopAtYearEndParam: {
    name: 'stopatyearend',
    in: 'query',
    description: 'Whether to stop the data at the year end. If true, will only show data until the end of the current Skyblock year, otherwise will return the full year starting from the \'from\' timestamp, possibly including part of the next year.',
    default: false,
    required: false,
    schema: {
      type: 'boolean',
    },
  },
};
