/* eslint-disable consistent-return */
const async = require('async');
const filterObject = require('filter-obj');
const pify = require('pify');
const constants = require('hypixelconstants');
const redis = require('../store/redis');
const buildPlayerStatus = require('../store/buildPlayerStatus');
const getUUID = require('../store/getUUID');
const buildBazaar = require('../store/buildBazaar');
const buildBans = require('../store/buildBans');
const buildBoosters = require('../store/buildBoosters');
const leaderboards = require('../store/leaderboards');
const { getAuctions, queryAuctionId } = require('../store/queryAuctions');
const { getGuildFromPlayer } = require('../store/buildGuild');
const { buildProfileList, buildProfile } = require('../store/buildSkyBlockProfiles');
const { playerObject } = require('./objects');
const { populatePlayers, getPlayer, PlayerError } = require('../store/buildPlayer');
const { getMetadata } = require('../store/queries');
const {
  generateJob, getData, typeToStandardName, getPlayerFields,
} = require('../util/utility');
const {
  playerNameParam, gameNameParam, typeParam, columnParam, filterParam, sortByParam,
  limitParam, significantParam, populatePlayersParam, templateParam, itemIdParam, bazaarItemIdParam,
  fromParam, toParam, auctionUUIDParam, itemUUIDParam, activeParam, pageParam, sortOrderParam,
  profileIdParam,
} = require('./parameters');
const packageJson = require('../package.json');

const redisGetAsync = pify(redis.get).bind(redis);

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
          description: 'Damage value of the item. Appears only if not 0',
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
    description: `# Introduction
The Slothpixel API provides Hypixel related data.

Currently the API has a rate limit of **60 requests/minute** and **50,000 requests per month**. If you have higher data needs contact the admins on discord.
    
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
      name: 'player',
      description: 'Player stats',
    },
    {
      name: 'guild',
      description: 'Guild stats',
    },
    {
      name: 'skyblock',
      description: 'SkyBlock related data',
    },
    {
      name: 'leaderboards',
      description: 'Player leaderboards',
    },
    {
      name: 'boosters',
      description: 'List of Boosters',
    },
    {
      name: 'bans',
      description: 'Ban statistics',
    },
    {
      name: 'metadata',
      description: 'Serivce metadata',
    },
    {
      name: 'health',
      description: 'Service health',
    },
  ],
  paths: {
    '/players/{playerName}': {
      get: {
        summary: 'Get player stats by name or uuid',
        description: 'Returns player stats of one or up to 16 players. Multiple `playerName`s must be separated by a comma.',
        operationId: 'getPlayer',
        tags: [
          'player',
        ],
        parameters: [
          playerNameParam,
          {
            name: 'fields',
            in: 'query',
            description: 'A comma separated list of fields to include alongside basic stats.',
            required: false,
            deprecated: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  ...playerObject,
                },
              },
            },
          },
        },
        route: () => '/players/:player',
        func: async (request, response) => {
          const players = request.params.player.split(',').slice(0, 15);

          try {
            const result = await async.map(players, async (player) => {
              let player_ = await getPlayer(player);
              delete player_.achievements;
              delete player_.quests;
              const { fields } = request.query;
              if (fields) {
                player_ = getPlayerFields(player_, fields.split(','));
              }
              return player_;
            });

            if (result.length === 1) {
              return response.json(result[0]);
            }
            response.json(result);
          } catch (error) {
            response.status(error instanceof PlayerError ? error.status : 500).json({ error: error.message });
          }
        },
      },
    },
    '/players/{playerName}/achievements': {
      get: {
        summary: 'In-depth achievement stats',
        description: 'Returns player achievement stats',
        operationId: 'getPlayerAchievements',
        tags: [
          'player',
        ],
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
                    achievement_points: {
                      type: 'integer',
                      description: 'Total achievement points',
                    },
                    completed_tiered: {
                      type: 'integer',
                      description: 'Total tiered achievements completed',
                    },
                    completed_one_time: {
                      type: 'integer',
                      description: 'Total one time achievements completed',
                    },
                    completed_total: {
                      type: 'integer',
                      description: 'Total achievements completed',
                    },
                    rewards: {
                      type: 'object',
                      properties: {
                        200: {
                          type: 'integer',
                          description: 'Timestamp of reward goal claimed',
                        },
                      },
                    },
                    games: {
                      type: 'object',
                      properties: {
                        one_time: {
                          type: 'array',
                          items: {
                            description: 'Achievement name',
                            type: 'string',
                          },
                        },
                        tiered: {
                          type: 'array',
                          items: {
                            description: 'Achievement name',
                            type: 'integer',
                          },
                        },
                        completed: {
                          description: 'Total achievements completed in the game',
                          type: 'integer',
                        },
                        completed_tiered: {
                          description: 'Total tiered achievements completed in the game. Each tier counts as a completion',
                          type: 'integer',
                        },
                        completed_one_time: {
                          description: 'Total one time achievements completed in the game',
                          type: 'integer',
                        },
                        points: {
                          description: 'Total achievement points in the game',
                          type: 'integer',
                        },
                        points_tiered: {
                          description: 'Total achievement points from tiered achievements in the game',
                          type: 'integer',
                        },
                        points_one_time: {
                          description: 'Total achievement points from one time achievements in the game',
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
        route: () => '/players/:player/achievements',
        func: async (request, response) => {
          try {
            const { achievements } = await getPlayer(request.params.player);
            response.json(achievements);
          } catch (error) {
            response.status(error.status).json({ error: error.message });
          }
        },
      },
    },
    '/players/{playerName}/quests': {
      get: {
        summary: 'In-depth quest data',
        description: 'Returns player quest completions',
        operationId: 'getPlayerQuests',
        tags: [
          'player',
        ],
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
                    quests_completed: {
                      type: 'integer',
                      description: 'Total quests completed',
                    },
                    challenges_completed: {
                      type: 'integer',
                      description: 'Total challenges completed',
                    },
                    completions: {
                      type: 'object',
                      properties: {
                        game: {
                          type: 'array',
                          items: {
                            description: 'UNIX date',
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
        route: () => '/players/:player/quests',
        func: async (request, response) => {
          try {
            const { quests } = await getPlayer(request.params.player);
            return response.json(quests);
          } catch (error) {
            return response.status(error.status).json({ error: error.message });
          }
        },
      },
    },
    '/players/{playerName}/recentGames': {
      get: {
        summary: 'Get recent games played',
        description: 'Returns up to 100 most recent games played by player. Games are stored for 3 days and may be hidden by the player.',
        operationId: 'getPlayerRecentGames',
        tags: [
          'player',
        ],
        parameters: [
          playerNameParam,
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
                      date: {
                        type: 'integer',
                      },
                      gameType: {
                        type: 'string',
                      },
                      mode: {
                        type: 'string',
                      },
                      map: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/players/:player/recentGames',
        func: async (request, response, callback) => {
          try {
            const uuid = await getUUID(request.params.player);
            try {
              const { games } = await getData(redis, generateJob('recentgames', { id: uuid }).url);
              response.json(games.map((game) => {
                game.gameType = typeToStandardName(game.gameType);
                return game;
              }));
            } catch (error) {
              callback(error.message);
            }
          } catch (error) {
            response.status(404).json({ error: error.message });
          }
        },
      },
    },
    '/players/{playerName}/status': {
      get: {
        summary: 'Get current player activity',
        description: 'Returns the current online status and game for a player.',
        operationId: 'getPlayerStatus',
        tags: [
          'player',
        ],
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
                    online: {
                      type: 'boolean',
                    },
                    game: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                        },
                        mode: {
                          type: 'string',
                        },
                        map: {
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
        route: () => '/players/:player/status',
        func: async (request, response, callback) => {
          try {
            const data = await buildPlayerStatus(request.params.player);
            response.json(data);
          } catch (error) {
            callback(error.message);
          }
        },
      },
    },
    '/guilds/{playerName}': {
      get: {
        summary: 'Get guild stats by user\'s username or uuid',
        description: 'Look up a guild from the name of one of it\'s members',
        operationId: 'getGuildFromPlayer',
        tags: [
          'guild',
        ],
        parameters: [
          playerNameParam, populatePlayersParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      description: 'Guild\'s name',
                      type: 'string',
                    },
                    id: {
                      description: 'Guild id used in hypixel backend',
                      type: 'string',
                    },
                    created: {
                      description: 'Guild creation date',
                      type: 'string',
                    },
                    tag: {
                      description: 'Guild tag',
                      type: 'string',
                    },
                    tag_color: {
                      description: 'Formatting code for the guild tag',
                      type: 'string',
                    },
                    tag_formatted: {
                      description: 'Formatted tag string e.g. \'&b[TAG]\'',
                      type: 'string',
                    },
                    legacy_ranking: {
                      description: 'Ranking in the number of guild coins owned in the legacy guild system',
                      type: 'integer',
                    },
                    exp: {
                      description: 'Total guild xp',
                      type: 'integer',
                    },
                    level: {
                      description: 'Guild level',
                      type: 'number',
                    },
                    exp_by_game: {
                      description: 'Guild EXP earned in each minigame',
                      type: 'integer',
                    },
                    exp_history: {
                      description: 'Contains raw guild xp earned in the past week. Uses format YYYY-MM-DD.',
                      type: 'object',
                    },
                    description: {
                      description: 'Guild description',
                      type: 'string',
                    },
                    preferred_games: {
                      description: 'Array containing the guild\'s preferred games',
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    ranks: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                          },
                          permissions: {
                            type: 'array',
                            items: {
                              type: 'number',
                            },
                          },
                          default: {
                            type: 'boolean',
                          },
                          tag: {
                            type: 'string',
                          },
                          created: {
                            type: 'integer',
                          },
                          priority: {
                            type: 'integer',
                          },
                        },
                      },
                    },
                    members: {
                      description: 'Array of players on the guild',
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          uuid: {
                            description: 'Player UUID',
                            type: 'string',
                          },
                          rank: {
                            description: 'Player rank in the guild',
                            type: 'string',
                          },
                          joined: {
                            description: 'Member join date',
                            type: 'integer',
                          },
                          quest_participation: {
                            description: 'How many much the member has contributed to guild quests',
                            type: 'integer',
                          },
                          exp_history: {
                            description: 'Contains raw guild xp earned in the past week. Uses format YYYY-MM-DD.',
                            type: 'object',
                          },
                          muted_till: {
                            description: 'Date the member is muted until',
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
        route: () => '/guilds/:player',
        func: async (request, response, callback) => {
          try {
            const guild = await getGuildFromPlayer(request.params.player, { shouldPopulatePlayers: request.query.populatePlayers });
            if (guild.guild === null) {
              return response.status(404).json(guild);
            }
            return response.json(guild);
          } catch (error) {
            callback(error);
          }
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
        summary: 'Get list of player\'s skyblock profiles',
        description: 'Gets all skyblock profiles for the specified player',
        operationId: 'getSkyblockProfiles',
        tags: [
          'skyblock',
        ],
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
                    PROFILE_ID: {
                      type: 'object',
                      properties: {
                        profile_id: {
                          type: 'string',
                        },
                        cute_name: {
                          type: 'string',
                          description: 'Profile name, e.g. Strawberry',
                        },
                        first_join: {
                          type: 'integer',
                        },
                        last_save: {
                          type: 'integer',
                        },
                        collections_unlocked: {
                          type: 'integer',
                        },
                        members: {
                          type: 'array',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/skyblock/profiles/:player',
        func: async (request, response, callback) => {
          try {
            const uuid = await getUUID(request.params.player);
            try {
              let profiles = {};
              const data = await redisGetAsync(`skyblock_profiles:${uuid}`);
              if (data) {
                profiles = JSON.parse(data) || {};
                // TODO - populatePlayers for each profile
              } else {
                profiles = await buildProfileList(uuid);
              }
              return response.json(profiles);
            } catch (error) {
              callback(error);
            }
          } catch (error) {
            response.status(404).json({ error: error.message });
          }
        },
      },
    },
    '/skyblock/profile/{playerName}/{profileId}': {
      get: {
        summary: 'Return a skyblock profile',
        description: 'If no profile is specified, the last played profile is returned',
        operationId: 'getSkyblockPlayerProfile',
        tags: [
          'skyblock',
        ],
        parameters: [
          playerNameParam, profileIdParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
        },
        route: () => '/skyblock/profile/:player/:profile?',
        func: async (request, response) => {
          try {
            const uuid = await getUUID(request.params.player);
            try {
              // TODO: Update when buildProfile changed
              const profile = await buildProfile(uuid, request.params.profile);
              try {
                const players = await populatePlayers(Object.keys(profile.members).map((uuid) => ({ uuid })));
                players.forEach((player) => {
                  profile.members[player.profile.uuid].player = player.profile;
                });
                response.json(profile);
              } catch (error) {
                response.status(500).json({ error });
              }
            } catch (error) {
              response.status(404).json({ error: error.message });
            }
          } catch (error) {
            response.status(404).json({ error: error.message });
          }
        },
      },
    },
    '/skyblock/auctions': {
      get: {
        summary: 'Query all skyblock auctions',
        description: 'Allows you to query all auctions and filter the results based on things such as item, rarity, enchantments or date.',
        operationId: 'getSkyblockAuctions',
        tags: [
          'skyblock',
        ],
        parameters: [
          filterParam, limitParam, pageParam, activeParam, auctionUUIDParam, itemUUIDParam, sortOrderParam, {
            name: 'sortBy',
            in: 'query',
            description: 'Which stat to sort records by. Requires the full path when used with nested objects like stats.Arcade.wins',
            required: true,
            schema: {
              type: 'string',
            },
          },
          {
            name: 'id',
            in: 'query',
            description: 'Item id, e.g. HOT_POTATO_BOOK. All available item ids can be found on the [items endpoint](https://api.slothpixel.me/api/skyblock/items).',
            required: false,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: auctionObject,
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
            response.status(400).json({ error });
          }
        },
      },
    },
    '/skyblock/auctions/{itemId}': {
      get: {
        summary: 'Query past skyblock auctions and their stats by item',
        description: 'Allows you to query past auctions for an item within specified time range. Also returns some statistical constants for this data.',
        operationId: 'getSkyblockAuctionItem',
        tags: [
          'skyblock',
        ],
        parameters: [
          itemIdParam, fromParam, toParam,
          {
            name: 'showAuctions',
            in: 'query',
            description: 'Returns the specified auctions individually',
            required: false,
            default: false,
            schema: {
              type: 'boolean',
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
                    average_price: {
                      description: 'Average price in the selected time period',
                      type: 'integer',
                    },
                    median_price: {
                      description: 'Median price in the selected time period',
                      type: 'integer',
                    },
                    standard_deviation: {
                      description: 'Standard deviation of prices in the selected time period',
                      type: 'integer',
                    },
                    min_price: {
                      description: 'Lowest price in the selected time period',
                      type: 'integer',
                    },
                    max_price: {
                      description: 'Largest price in the selected time period',
                      type: 'integer',
                    },
                    sold: {
                      description: 'Total sold items in the selected time period',
                      type: 'integer',
                    },
                    auctions: {
                      description: '',
                      type: 'object',
                      properties: {
                        1577033426093: {
                          type: 'object',
                          description: 'Auction object',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/skyblock/auctions/:id',
        func: async (request, response, callback) => {
          const { from, to, showAuctions } = request.query;
          try {
            const result = await queryAuctionId(from, to, showAuctions, request.params.id);
            response.json(result);
          } catch (error) {
            callback(response.status(404).json({ error: error.message }));
          }
        },
      },
    },
    '/skyblock/items': {
      get: {
        summary: 'SkyBlock item spec',
        description: 'Returns all SkyBlock items found in auctions',
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
            const items = await redisGetAsync('skyblock_items');
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
        summary: 'Get bazaar data for an item',
        description: 'Get bazaar data for an item by ID. You can see which items are available in the bazaar via the `/skyblock/items` endpoint. If none is specified returns all items.',
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
                      week_historic: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            timestamp: {
                              type: 'integer',
                            },
                            nowBuyVolume: {
                              type: 'integer',
                            },
                            nowSellVolume: {
                              type: 'integer',
                            },
                            buyCoins: {
                              type: 'number',
                            },
                            buyVolume: {
                              type: 'integer',
                            },
                            buys: {
                              type: 'integer',
                            },
                            sellCoins: {
                              type: 'number',
                            },
                            sellVolume: {
                              type: 'integer',
                            },
                            sells: {
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
          const data = await redisGetAsync('skyblock_bazaar');
          const ids = JSON.parse(data) || [];
          if (itemId && !itemId.includes(',') && !ids.includes(itemId)) {
            return response.status(400).json({ error: 'Invalid itemId' });
          }
          try {
            const bazaar = await buildBazaar();
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
          leaderboards(request.query, request.params.template, (error, lb) => {
            if (error) {
              return callback(response.status(400).json({ error }));
            }
            return response.json(lb);
          });
        },
      },
    },
    '/boosters': {
      get: {
        summary: 'Get list of network boosters',
        description: 'Returns a list of boosters for all server gamemodes',
        operationId: 'getBoosters',
        tags: [
          'boosters',
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
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          uuid: {
                            description: 'UUID of booster owner',
                            type: 'string',
                          },
                          multiplier: {
                            description: 'Booster coin multiplier',
                            type: 'number',
                          },
                          activated: {
                            description: 'UNIX timestamp of activation date',
                            type: 'integer',
                          },
                          originalLength: {
                            description: 'Original duration in seconds',
                            type: 'integer',
                          },
                          length: {
                            description: 'Current length in seconds',
                            type: 'integer',
                          },
                          active: {
                            description: 'Whether the booster is currently active',
                            type: 'boolean',
                          },
                          stacked: {
                            description: 'Array of players that have stacked a booster on the same slot',
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
            },
          },
        },
        route: () => '/boosters',
        func: async (_, response) => {
          try {
            const boosters = await buildBoosters();
            response.json(boosters);
          } catch (error) {
            response.status(500).json({ error: error.message });
          }
        },
      },
    },
    '/boosters/{game}': {
      get: {
        summary: 'Get boosters for a specified game',
        description: 'Returns a list of active boosters for the specified game',
        operationsId: 'getGameBoosters',
        tags: [
          'boosters',
        ],
        parameters: [
          gameNameParam,
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
                        description: 'UUID of booster owner',
                        type: 'string',
                      },
                      multiplier: {
                        description: 'Booster coin multiplier',
                        type: 'number',
                      },
                      activated: {
                        description: 'UNIX timestamp of activation date',
                        type: 'integer',
                      },
                      originalLength: {
                        description: 'Original duration in seconds',
                        type: 'integer',
                      },
                      length: {
                        description: 'Current length in seconds',
                        type: 'integer',
                      },
                      active: {
                        description: 'Whether the booster is currently active',
                        type: 'boolean',
                      },
                      stacked: {
                        description: 'Array of players that have stacked a booster on the same slot',
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
        },
        route: () => '/boosters/:game',
        func: async (request, response) => {
          const { game } = request.params;
          try {
            const boosters = await buildBoosters();
            if (!Object.hasOwnProperty.call(boosters.boosters, game)) {
              return response.status(400).json({ error: 'Invalid minigame name!' });
            }
            response.json(boosters.boosters[game]);
          } catch (error) {
            response.status(500).json({ error: error.message });
          }
        },
      },
    },
    '/bans': {
      get: {
        summary: 'Get network ban information',
        description: 'Returns information about the number of staff and watchdog server bans',
        operationId: 'getBans',
        tags: [
          'bans',
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    watchdog: {
                      type: 'object',
                      properties: {
                        last_minute: {
                          description: 'Watchdog\'s bans in the last minute',
                          type: 'integer',
                        },
                        daily: {
                          description: 'Watchdog bans in the last day',
                          type: 'integer',
                        },
                        total: {
                          description: 'Total Watchdog bans, ever',
                          type: 'integer',
                        },
                      },
                    },
                    staff: {
                      type: 'object',
                      properties: {
                        daily: {
                          description: 'Staff bans in the last day',
                          type: 'integer',
                        },
                        total: {
                          description: 'Total staff bans, ever',
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
        route: () => '/bans',
        func: async (_, response) => {
          try {
            response.json(await buildBans());
          } catch (error) {
            response.status(500).json({ error: error.message });
          }
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
  },
};

module.exports = spec;
