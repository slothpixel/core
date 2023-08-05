/* eslint-disable consistent-return,no-unused-vars,arrow-body-style */
const async = require('async');
const filterObject = require('filter-obj');
const constants = require('hypixelconstants');
const redis = require('../store/redis');
const buildPlayerStatus = require('../store/buildPlayerStatus');
const getUUID = require('../store/getUUID');
const buildBans = require('../store/buildBans');
const buildBoosters = require('../store/buildBoosters');
const buildCounts = require('../store/buildCounts');
const { getAuctions } = require('../store/queryAuctions');
const buildGuild = require('../store/buildGuild');
const { buildProfileList, buildProfile } = require('../store/buildSkyBlockProfiles');
const { buildSkyblockCalendar, buildSkyblockEvents } = require('../store/buildSkyblockCalendar');
const { playerObject } = require('./objects');
const { populatePlayers, getPlayer, PlayerError } = require('../store/buildPlayer');
const { getMetadata } = require('../store/queries');
const {
  logger, generateJob, getData, typeToCleanName, getPlayerFields,
} = require('../util/utility');
const {
  playerNameParam, gameNameParam, limitParam, populatePlayersParam, bazaarItemIdParam,
  auctionUUIDParam, pageParam, sortOrderParam, profileIdParam, guildNameParam, guildIDParam,
  calendarEventsParam, calendarFromParam, calendarToParam, calendarYearsParam, calendarStopAtYearEndParam,
} = require('./parameters');
const packageJson = require('../package.json');

const deprecatedResponse = (response) => {
  return response.status(410).json({
    error: 'This endpoint has been removed due to new Hypixel API Policy.',
  });
};

const auctionObject = {
  type: 'object',
  description: 'Auction object',
  properties: {
    uuid: {
      type: 'string',
      description: 'Auction uuid',
    },
    start: {
      type: 'integer',
      description: 'UNIX timestamp of auction start date',
    },
    end: {
      type: 'integer',
      description: 'UNIX timestamp of auction end date',
    },
    tier: {
      type: 'string',
      description: 'Item rarity, e.g. "RARE"',
    },
    category: {
      type: 'string',
      description: 'Item category, e.g. "misc"',
    },
    item: {
      type: 'object',
      properties: {
        item_id: {
          type: 'integer',
          description: 'Item\'s minecraft id',
        },
        name: {
          type: 'string',
          description: 'Item name with formatting',
        },
        lore: {
          type: 'array',
          description: 'Array of strings containing item\'s lore with formatting',
          items: {
            type: 'string',
          },
        },
        count: {
          type: 'integer',
          description: 'How many items are for sale in the auction',
        },
        damage: {
          type: 'integer',
          description: 'Damage value of the item.',
        },
        attributes: {
          type: 'object',
          properties: {
            modifier: {
              type: 'string',
              description: 'Item modifier e.g. "spicy"',
            },
            enchantments: {
              type: 'object',
              description: 'Object containing item\'s enchantments in type:level format e.g. sharpness: 5.',
            },
            origin: {
              type: 'string',
              description: 'Item\'s origin, for example "CRAFTING_GRID"',
            },
            id: {
              type: 'string',
              description: 'Item id, e.g. "ASPECT_OF_THE_END"',
            },
            uuid: {
              type: 'string',
              description: 'Item\'s unique uuid if it has one. Can be used to track previous auctions of the same item',
            },
            texture: {
              type: 'string',
              description: 'If the item is a minecraft skull, i.e. a talisman, this property contains the texture id. Textures can be found at http://textures.minecraft.net/texture/{id}',
            },
            timestamp: {
              type: 'integer',
              description: 'Creation date',
            },
          },
        },
      },
    },
    starting_bid: {
      type: 'integer',
    },
    highest_bid_amount: {
      type: 'integer',
    },
    bids: {
      type: 'array',
      description: 'All current bids',
      items: {
        type: 'object',
        properties: {
          bidder: {
            type: 'string',
            description: 'Bidder\'s uuid',
          },
          profile_id: {
            type: 'string',
            description: 'Bidder\'s skyblock profile id',
          },
          amount: {
            type: 'integer',
            description: 'Bidded coins',
          },
          timestamp: {
            type: 'integer',
            description: 'Bid UNIX timestamp',
          },
        },
      },
    },
  },
};

const spec = {
  openapi: '3.0.0',
  servers: [
    {
      url: 'https://api.slothpixel.me/api',
    },
  ],
  info: {
    description: `# IMPORTANT:
Due to changes to Hypixel API policy, we will be retiring all endpoints that require us to use an API key. The affected endpoints have been marked as 'deprecated'. These changes will go into effect in August 2023.    
    
# Introduction
The Slothpixel API provides Hypixel related data.

Currently the API has a rate limit of **60 requests/minute** and **50,000 requests per month**. If you have higher data needs contact the admins on discord.

Consider supporting The Slothpixel Project on Patreon to help cover the hosting costs.

[Discord](https://discord.gg/ND9bJKK) | [Patreon](https://patreon.com/slothpixel)

# GraphQL
    Slothpixel API supports the use of GraphQL query language, and it is recommended for advanced users. [Read more](https://github.com/slothpixel/core/wiki/GraphQL)
    `,
    version: packageJson.version,
    title: 'Slothpixel API',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  components: {
    securitySchemes: {
      key: {
        type: 'apiKey',
        name: 'key',
        description: `Use an API key to remove monthly call limits and to receive higher rate limits.

      Usage example: https://api.slothpixel.me/api/players/slothpixel?key=YOUR-API-KEY

      API key can also be sent using the authorization header "Authorization: Bearer YOUR-API-KEY"
      `,
        in: 'query',
      },
    },
  },
  host: 'api.slothpixel.me',
  basePath: '/api',
  produces: [
    'application/json',
  ],
  tags: [
    {
      name: 'skyblock',
      description: 'SkyBlock related data',
    },
    /*
    {
      name: 'leaderboards',
      description: 'Player leaderboards',
    },
    {
      name: 'metadata',
      description: 'Serivce metadata',
    },
    {
      name: 'health',
      description: 'Service health',
    },
     */
  ],
  paths: {
    '/players/{playerName}': {
      get: {
        deprecated: true,
        route: () => '/players/:player',
        func: async (request, response) => {
          deprecatedResponse(response);
        },
      },
    },
    '/players/{playerName}/achievements': {
      get: {
        deprecated: true,
        route: () => '/players/:player/achievements',
        func: async (request, response) => {
          deprecatedResponse(response);
        },
      },
    },
    '/players/{playerName}/quests': {
      get: {
        deprecated: true,
        route: () => '/players/:player/quests',
        func: async (request, response) => {
          deprecatedResponse(response);
        },
      },
    },
    '/players/{playerName}/recentGames': {
      get: {
        deprecated: true,
        route: () => '/players/:player/recentGames',
        func: async (request, response, callback) => {
          deprecatedResponse(response);
        },
      },
    },
    '/players/{playerName}/status': {
      get: {
        deprecated: true,
        route: () => '/players/:player/status',
        func: async (request, response, callback) => {
          deprecatedResponse(response);
        },
      },
    },
    '/guilds/{playerName}': {
      get: {
        deprecated: true,
        route: () => '/guilds/:player',
        func: async (request, response, callback) => {
          deprecatedResponse(response);
        },
      },
    },
    '/guilds/name/{guildName}': {
      get: {
        deprecated: true,
        route: () => '/guilds/name/:name',
        func: async (request, response, callback) => {
          deprecatedResponse(response);
        },
      },
    },
    '/guilds/id/{guildID}': {
      get: {
        deprecated: true,
        route: () => '/guilds/id/:id',
        func: async (request, response, callback) => {
          deprecatedResponse(response);
        },
      },
    },
    /*
          '/sessions/{playerName}': {
            get: {
              tags: [
                'session',
              ],
              summary: 'Get guild stats by user\'s username or uuid',
              parameters: [
                playerNameParam,
              ],
              responses: {
                200: {
                  description: 'successful operation',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          game: {
                            description: 'Minigame in standard format',
                            type: 'string',
                          },
                          server: {
                            description: 'Player\'s current server, e.g. mini103M',
                            type: 'string',
                          },
                          players: {
                            description: 'Array of players on the same server',
                            type: 'array',
                            items: {
                              description: 'Player uuid',
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              route: () => '/sessions/:player',
              func: (req, res, cb) => {},
            },
          },
            '/friends/{playerName}': {
              get: {
                tags: [
                  'friends',
                ],
                summary: 'Get player\'s friends by user\'s username or uuid',
                parameters: [
                  playerNameParam,
                  },
                ],
                responses: {
                  200: {
                    description: 'successful operation',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              uuid: {
                                description: 'Friend\'s uuid',
                                type: 'string',
                              },
                              sent_by: {
                                description: 'UUID of the player who sent the friend request',
                                type: 'string',
                              },
                              started: {
                                description: 'Date the friendship started',
                                type: 'integer',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            */
    '/skyblock/profiles/{playerName}': {
      get: {
        deprecated: true,
        route: () => '/skyblock/profiles/:player',
        func: async (request, response, callback) => {
          deprecatedResponse(response);
        },
      },
    },
    '/skyblock/profile/{playerName}/{profileId}': {
      get: {
        deprecated: true,
        route: () => '/skyblock/profile/:player/:profile?',
        func: async (request, response, callback) => {
          deprecatedResponse(response);
        },
      },
    },
    '/skyblock/auctions': {
      get: {
        summary: 'Query active skyblock auctions',
        description: 'Allows you to query active auctions and filter the results based on things such as item ID, rarity, bin or category.',
        operationId: 'getSkyblockAuctions',
        tags: [
          'skyblock',
        ],
        parameters: [
          limitParam, pageParam, auctionUUIDParam, sortOrderParam, {
            name: 'sortBy',
            in: 'query',
            description: 'Which field to sort records by. Choosing to sort by a custom field may lead to slow queries.',
            required: false,
            schema: {
              type: 'string',
              default: 'end',
            },
          },
          {
            name: 'id',
            in: 'query',
            description: 'Item id, e.g. NEW_YEAR_CAKE. All available item ids can be found on the [items endpoint](https://api.slothpixel.me/api/skyblock/items).',
            required: false,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'bin',
            in: 'query',
            description: 'When `true`, returns only bin auctions and when `false`, returns only normal auctions. Both types are returned if the parameter is not specified.',
            required: false,
            schema: {
              type: 'boolean',
            },
          },
          {
            name: 'rarity',
            in: 'query',
            description: 'Filter by item rarity',
            required: false,
            schema: {
              type: 'enum',
              enum: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'DIVINE', 'SUPREME', 'SPECIAL', 'VERY_SPECIAL'],
            },
          },
          {
            name: 'category',
            in: 'query',
            description: 'Filter by item category',
            required: false,
            schema: {
              type: 'enum',
              enum: ['accessories', 'armor', 'blocks', 'consumables', 'misc', 'weapon'],
            },
          },
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    last_updated: {
                      type: 'integer',
                    },
                    total_auctions: {
                      type: 'integer',
                    },
                    matching_query: {
                      type: 'integer',
                    },
                    auctions: {
                      type: 'array',
                      items: auctionObject,
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/skyblock/auctions',
        func: async (request, response) => {
          try {
            const auctions = await getAuctions(request.query);
            response.json(auctions);
          } catch (error) {
            response.status(400).json({ error: error.message });
          }
        },
      },
    },
    '/skyblock/items': {
      get: {
        summary: 'SkyBlock item spec',
        description: 'Returns all SkyBlock items',
        operationId: 'getSkyblockItems',
        tags: [
          'skyblock',
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ITEM_ID: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        tier: auctionObject.properties.tier,
                        category: auctionObject.properties.category,
                        item_id: auctionObject.properties.item.properties.item_id,
                        damage: auctionObject.properties.item.properties.damage,
                        texture: auctionObject.properties.item.properties.attributes.properties.texture,
                        bazaar: {
                          type: 'boolean',
                          description: 'Set to true if the item can be found in the bazaar',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/skyblock/items',
        func: async (_, response, callback) => {
          try {
            const items = await redis.get('skyblock_items');
            return response.json(JSON.parse(items));
          } catch (error) {
            callback(error);
          }
        },
      },
    },
    '/skyblock/bazaar/{itemId}': {
      get: {
        tags: [
          'skyblock',
        ],
        summary: 'Get bazaar data for an item or for all items',
        description: 'Get bazaar data for an item by ID, or for all items. You can see which items are available in the bazaar via the `/skyblock/items` endpoint. If none is specified returns all items.',
        parameters: [bazaarItemIdParam],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                      },
                      category: {
                        type: 'string',
                      },
                      related: {
                        type: 'array',
                        items: {
                          type: 'string',
                          description: 'Item ID',
                        },
                      },
                      quick_status: {
                        type: 'object',
                        properties: {
                          buyPrice: {
                            type: 'number',
                          },
                          buyVolume: {
                            type: 'integer',
                          },
                          buyMovingWeek: {
                            type: 'integer',
                          },
                          buyOrders: {
                            type: 'integer',
                          },
                          sellPrice: {
                            type: 'number',
                          },
                          sellVolume: {
                            type: 'integer',
                          },
                          sellMovingWeek: {
                            type: 'integer',
                          },
                          sellOrders: {
                            type: 'integer',
                          },
                        },
                      },
                      buy_summary: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            amount: {
                              type: 'integer',
                            },
                            pricePerUnit: {
                              type: 'number',
                            },
                            orders: {
                              type: 'integer',
                            },
                          },
                        },
                      },
                      sell_summary: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            amount: {
                              type: 'integer',
                            },
                            pricePerUnit: {
                              type: 'number',
                            },
                            orders: {
                              type: 'integer',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/skyblock/bazaar/:id?',
        func: async (request, response, callback) => {
          const itemId = request.params.id;
          try {
            const data = await redis.get('skyblock_bazaar');
            if (data === null) {
              logger.warn('No products found, is the bazaar service running?');
              return callback('No bazaar items available');
            }
            const bazaar = JSON.parse(data);
            if (itemId && !itemId.includes(',') && !Object.keys(bazaar).includes(itemId)) {
              return response.status(400).json({ error: 'Invalid itemId' });
            }
            if (!itemId) {
              return response.json(bazaar);
            }
            if (itemId.includes(',')) {
              return response.json(filterObject(bazaar, itemId.split(',')));
            }
            return response.json(bazaar[itemId]);
          } catch (error) {
            callback(error.message);
          }
        },
      },
    },
    '/skyblock/events': {
      get: {
        summary: 'SkyBlock event spec',
        description: 'Returns SkyBlock events. Use key for the events parameter in /calendar/events endpoint',
        operationId: 'getSkyblockEvents',
        tags: [
          'skyblock',
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    EVENT_ENUM: {
                      description: 'The cleaner name of the event. Use key for the events parameter in /calendar/events endpoint',
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/skyblock/events',
        func: (_, response) => {
          response.json(buildSkyblockEvents());
        },
      },
    },
    '/skyblock/calendar': {
      get: {
        summary: 'Get Skyblock calendar information',
        description: 'Returns information about the SkyBlock calendar',
        operationId: 'getSkyblockCalendar',
        tags: [
          'skyblock',
        ],
        parameters: [
          calendarEventsParam, calendarFromParam, calendarToParam, calendarYearsParam, calendarStopAtYearEndParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    from: {
                      description: 'The timestamp of the \'from\' parameter',
                      type: 'integer',
                    },
                    to: {
                      description: 'The timestamp of the \'to\' parameter',
                      type: 'integer',
                    },
                    date: {
                      description: 'The date based on \'from\' parameter, e.g Early Winter 14th',
                      type: 'string',
                    },
                    day: {
                      description: 'The current day based on \'from\' parameter',
                      type: 'integer',
                    },
                    month: {
                      description: 'The current month based on \'from\' parameter',
                      type: 'string',
                    },
                    year: {
                      description: 'The current year based on \'from\' parameter',
                      type: 'integer',
                    },
                    time: {
                      description: 'The current time based on \'from\' parameter',
                      type: 'string',
                    },
                    minute: {
                      description: 'The current minute based on \'from\' parameter',
                      type: 'integer',
                    },
                    hour: {
                      description: 'The current hour based on \'from\' parameter',
                      type: 'integer',
                    },
                    next_day_countdown: {
                      description: 'The time until the next day based on \'from\' parameter',
                      type: 'integer',
                    },
                    next_month_countdown: {
                      description: 'The time until the next month based on \'from\' parameter',
                      type: 'integer',
                    },
                    next_year_countdown: {
                      description: 'The time until the next year based on \'from\' parameter',
                      type: 'integer',
                    },
                    events: {
                      type: 'object',
                      properties: {
                        EVENT_ENUM: {
                          type: 'object',
                          properties: {
                            name: {
                              description: 'The cleaner name of the event',
                              type: 'string',
                            },
                            duration: {
                              description: 'The time the event is active',
                              type: 'integer',
                            },
                            events: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  start_timestamp: {
                                    description: 'The starting timestamp of the event',
                                    type: 'integer',
                                  },
                                  end_timestamp: {
                                    description: 'The ending timestamp of the event',
                                    type: 'integer',
                                  },
                                  starting_in: {
                                    description: 'The time until the event starts',
                                    type: 'integer',
                                  },
                                  ending_in: {
                                    description: 'The time until the event ends',
                                    type: 'integer',
                                  },
                                  pet: {
                                    description: 'The type of pet if the event is a Traveling Zoo',
                                    type: 'string',
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/skyblock/calendar',
        func: (request, response) => {
          const {
            events, from, to, years, stopatyearend,
          } = request.query;
          try {
            const result = buildSkyblockCalendar(events, from, to, years, stopatyearend);
            response.json(result);
          } catch (error) {
            response.status(400).json({ error: error.message });
          }
        },
      },
    },
    /*
    '/leaderboards': {
      get: {
        summary: 'Allows query of dynamic leaderboards',
        description: 'Returns player or guild leaderboards',
        operationId: 'getLeaderboards',
        tags: [
          'leaderboards',
        ],
        parameters: [
          typeParam, columnParam, sortByParam, sortOrderParam, filterParam, limitParam, pageParam, significantParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {},
                  },
                },
              },
            },
          },
        },
        route: () => '/leaderboards',
        func: (request, response) => {
          return response.status(503).json({ error: 'Endpoint disabled for maintenance' });
                      leaderboards(request.query, null, (error, lb) => {
                        if (error) {
                          return response.status(400).json({ error });
                        }
                        return response.json(lb);
                      });
        },
      },
    },
    '/leaderboards/{template}': {
      get: {
        summary: 'Get predefined leaderboards',
        description: 'Choose a predefined leaderboard, e.g. "general_level". Possible options can be retrieved from /metadata endpoint.',
        operationId: 'getLeaderboardTemplate',
        tags: [
          'leaderboards',
        ],
        parameters: [
          templateParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {},
                  },
                },
              },
            },
          },
        },
        route: () => '/leaderboards/:template',
        func: (request, response, callback) => {
          return response.status(503).json({ error: 'Endpoint disabled for maintenance' });
                      leaderboards(request.query, request.params.template, (error, lb) => {
                        if (error) {
                          return callback(response.status(400).json({ error }));
                        }
                        return response.json(lb);
                      });
        },
      },
    },
    */
    '/boosters': {
      get: {
        deprecated: true,
        route: () => '/boosters',
        func: async (_, response) => {
          deprecatedResponse(response);
        },
      },
    },
    '/boosters/{game}': {
      get: {
        deprecated: true,
        route: () => '/boosters/:game',
        func: async (request, response) => {
          deprecatedResponse(response);
        },
      },
    },
    '/bans': {
      get: {
        deprecated: true,
        route: () => '/bans',
        func: async (_, response) => {
          deprecatedResponse(response);
        },
      },
    },
    '/counts': {
      get: {
        deprecated: true,
        route: () => '/counts',
        func: async (_, response) => {
          deprecatedResponse(response);
        },
      },
    },
    '/constants/{resource}': {
      get: {
        summary: 'GET /constants',
        description: 'Get static game data mirrored from the hypixelconstants repository. If no resource is specified, returns an array of available resources.',
        tags: ['constants'],
        parameters: [{
          name: 'resource',
          in: 'path',
          description: 'Resource name e.g. `languages`. [List of resources](https://github.com/slothpixel/hypixelconstants/tree/master/build)',
          required: false,
          type: 'string',
        }],
        route: () => '/constants/:resource?',
        func: (request, response, callback) => {
          if (!request.params.resource) {
            return response.json(Object.keys(constants));
          }
          const { resource } = request.params;
          if (resource in constants) {
            return response.json(constants[resource]);
          }
          return callback();
        },
      },
    },
    /*
    '/metadata': {
      get: {
        summary: 'GET /metadata',
        description: 'Site metadata',
        operationId: 'getMetadata',
        tags: [
          'metadata',
        ],
        responses: {
          200: {
            description: 'Success',
            schema: {
              type: 'object',
              properties: {
                leaderboards: {
                  description: 'Template Leaderboards',
                  type: 'object',
                },
              },
            },
          },
        },
        route: () => '/metadata',
        func: (request, response, callback) => {
          getMetadata(request, (error, result) => {
            if (error) {
              return callback(error);
            }
            return response.json(result);
          });
        },
      },
    },
    '/health': {
      get: {
        summary: 'GET /health',
        description: 'Get service health data',
        operationId: 'getHealth',
        tags: ['health'],
        responses: {
          200: {
            description: 'Success',
            schema: {
              type: 'object',
            },
          },
        },
        route: () => '/health/:metric?',
        func: (request, response, callback) => {
          redis.hgetall('health', (error, result) => {
            if (error) {
              return callback(error);
            }
            const data = result || {};
            Object.keys(data).forEach((key) => {
              data[key] = JSON.parse(data[key]);
            });
            if (!request.params.metric) {
              return response.json(data);
            }
            const single = data[request.params.metric];
            const healthy = single.metric < single.threshold;
            return response.status(healthy ? 200 : 500).json(single);
          });
        },
      },
    },
     */
  },
};

module.exports = spec;
