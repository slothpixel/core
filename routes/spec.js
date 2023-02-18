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

const inventoryContainer = {
  type: 'array',
  description: 'Array of item objects. Empty slots are empty objects.',
  items: {
    type: 'object',
    properties: {
      active: {
        type: 'boolean',
      },
      name: {
        type: 'string',
      },
      rarity: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      stats: {
        type: 'object',
        properties: {
          stat: {
            type: 'integer',
          },
        },
      },
      damage: {
        type: 'integer',
        description: 'Item\'s minecraft damage value',
      },
      lore: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      attributes: {
        type: 'object',
        properties: {
          modifier: {
            type: 'string',
            description: 'E.g. Spicy',
          },
          enchantments: {
            type: 'object',
            properties: {
              enchantment: {
                type: 'integer',
              },
            },
          },
          anvil_uses: {
            type: 'integer',
          },
          hot_potato_count: {
            type: 'integer',
          },
          origin: {
            type: 'string',
          },
          id: {
            type: 'string',
            description: 'Item\'s Hypixel ID',
          },
          uuid: {
            type: 'string',
          },
          timestamp: {
            type: 'integer',
          },
        },
      },
      item_id: {
        type: 'string',
        description: 'Item\'s minecraft id',
      },
      count: {
        type: 'integer',
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
      name: 'boosters',
      description: 'List of Boosters',
    },
    {
      name: 'bans',
      description: 'Ban statistics',
    },
    {
      name: 'counts',
      description: 'Player counts',
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
                    legacy_achievement_points: {
                      type: 'integer',
                      description: 'Total legacy achievement points',
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
                        legacy: {
                          type: 'array',
                          items: {
                            description: 'All legacy achievements a player has.',
                            type: 'string',
                          },
                        },
                        tiered: {
                          type: 'object',
                          achievement_name: {
                            current_tier: {
                              description: 'Current Tier of tiered achievement',
                              type: 'integer',
                            },
                            current_amount: {
                              description: 'Current amount of tiered achievement',
                              type: 'integer',
                            },
                            max_tier: {
                              description: 'Max tier of tiered achievement',
                              type: 'integer',
                            },
                            max_tier_amount: {
                              description: 'Max amount of tiered achievement',
                              type: 'integer',
                            },
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
                        points_legacy: {
                          description: 'Total achievement points from legacy achievements in the game',
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
                game.gameType = typeToCleanName(game.gameType);
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
                    guild: {
                      description: 'Value indicating the success, or not, of the operation. Can be either true or null',
                      type: 'boolean',
                    },
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
                    guild_master: {
                      description: 'Member object of the guild master',
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
          let id;
          try {
            id = await getUUID(request.params.player);
          } catch {
            return response.status(404).json({ error: 'Invalid username' });
          }
          try {
            const guild = await buildGuild('player', id, { shouldPopulatePlayers: request.query.populatePlayers });
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
    '/guilds/name/{guildName}': {
      get: {
        summary: 'Get guild stats by the name of the guild',
        description: 'Look up a guild from the its name',
        operationId: 'getGuildFromName',
        tags: [
          'guild',
        ],
        parameters: [
          guildNameParam, populatePlayersParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    guild: {
                      description: 'Value indicating the success, or not, of the operation. Can be either true or null',
                      type: 'boolean',
                    },
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
                    guild_master: {
                      description: 'Member object of the guild master',
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
                      description: 'Array of players in the guild',
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
        route: () => '/guilds/name/:name',
        func: async (request, response, callback) => {
          try {
            const guild = await buildGuild('name', request.params.name, { shouldPopulatePlayers: request.query.populatePlayers });
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
    '/guilds/id/{guildID}': {
      get: {
        summary: 'Get guild stats by the internal ID of the guild',
        description: 'Look up a guild from the its ID',
        operationId: 'guild',
        tags: [
          'guild',
        ],
        parameters: [
          guildIDParam, populatePlayersParam,
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    guild: {
                      description: 'Value indicating the success, or not, of the operation. Can be either true or null',
                      type: 'boolean',
                    },
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
                    guild_master: {
                      description: 'Member object of the guild master',
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
                      description: 'Array playerof players on the guild',
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
        route: () => '/guilds/id/:id',
        func: async (request, response, callback) => {
          try {
            const guild = await buildGuild('id', request.params.id, { shouldPopulatePlayers: request.query.populatePlayers });
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
              const data = await redis.get(`skyblock_profiles:${uuid}`);
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
                  properties: {
                    members: {
                      type: 'object',
                      properties: {
                        uuid: {
                          type: 'object',
                          properties: {
                            uuid: {
                              type: 'string',
                            },
                            attributes: {
                              type: 'object',
                              properties: {
                                damage: {
                                  type: 'integer',
                                },
                                health: {
                                  type: 'number',
                                },
                                defense: {
                                  type: 'number',
                                },
                                effective_health: {
                                  type: 'integer',
                                },
                                strength: {
                                  type: 'number',
                                },
                                damage_increase: {
                                  type: 'number',
                                },
                                speed: {
                                  type: 'number',
                                },
                                crit_chance: {
                                  type: 'number',
                                },
                                crit_damage: {
                                  type: 'number',
                                },
                                bonus_attack_speed: {
                                  type: 'number',
                                },
                                intelligence: {
                                  type: 'number',
                                },
                                sea_creature_chance: {
                                  type: 'integer',
                                },
                                magic_find: {
                                  type: 'number',
                                },
                                pet_luck: {
                                  type: 'number',
                                },
                              },
                            },
                            first_join_hub: {
                              type: 'integer',
                            },
                            objectives: {
                              type: 'object',
                              properties: {
                                objective: {
                                  type: 'object',
                                  properties: {
                                    status: {
                                      type: 'string',
                                    },
                                    progress: {
                                      type: 'integer',
                                    },
                                    completed_at: {
                                      type: 'integer',
                                    },
                                  },
                                },
                              },
                            },
                            tutorial: {
                              type: 'array',
                              items: [
                                {
                                  type: 'string',
                                },
                              ],
                            },
                            quests: {
                              type: 'object',
                              properties: {
                                quest: {
                                  type: 'object',
                                  properties: {
                                    status: {
                                      type: 'string',
                                    },
                                    activated_at: {
                                      type: 'integer',
                                    },
                                    activated_at_sb: {
                                      type: 'integer',
                                    },
                                    completed_at: {
                                      type: 'integer',
                                    },
                                    completed_at_sb: {
                                      type: 'integer',
                                    },
                                  },
                                },
                              },
                            },
                            last_death: {
                              type: 'integer',
                            },
                            visited_zones: {
                              type: 'array',
                              items: [
                                {
                                  type: 'string',
                                },
                              ],
                            },
                            fishing_treasure_caught: {
                              type: 'integer',
                            },
                            death_count: {
                              type: 'integer',
                            },
                            achievement_spawned_island_types: {
                              type: 'array',
                              items: [
                                {
                                  type: 'string',
                                },
                              ],
                            },
                            wardrobe_equipped_slot: {
                              type: 'integer',
                            },
                            sacks_counts: {
                              type: 'object',
                              properties: {
                                ITEM_ID: {
                                  type: 'integer',
                                },
                              },
                            },
                            stats: {
                              type: 'object',
                              properties: {
                                total_kills: {
                                  type: 'integer',
                                },
                                total_deaths: {
                                  type: 'integer',
                                },
                                kills: {
                                  type: 'object',
                                  properties: {
                                    name: {
                                      type: 'integer',
                                    },
                                  },
                                },
                                total_dragon_kills: {
                                  type: 'integer',
                                },
                                deaths: {
                                  type: 'object',
                                  properties: {
                                    name: {
                                      type: 'integer',
                                    },
                                  },
                                },
                                highest_critical_damage: {
                                  type: 'integer',
                                },
                                ender_crystals_destroyed: {
                                  type: 'integer',
                                },
                                end_race_best_time: {
                                  type: 'number',
                                },
                                chicken_race_best_time: {
                                  type: 'number',
                                },
                                dungeon_hub_best_time: {
                                  type: 'object',
                                  properties: {
                                    type: {
                                      type: 'integer',
                                    },
                                  },
                                },
                                gifts_given: {
                                  type: 'integer',
                                },
                                gifts_received: {
                                  type: 'integer',
                                },
                                items_fished: {
                                  type: 'object',
                                  properties: {
                                    total: {
                                      type: 'integer',
                                    },
                                    normal: {
                                      type: 'integer',
                                    },
                                    treasure: {
                                      type: 'integer',
                                    },
                                    large_treasure: {
                                      type: 'integer',
                                    },
                                  },
                                },
                                auctions: {
                                  type: 'object',
                                  properties: {
                                    created: {
                                      type: 'integer',
                                    },
                                    completed: {
                                      type: 'integer',
                                    },
                                    no_bids: {
                                      type: 'integer',
                                    },
                                    won: {
                                      type: 'integer',
                                    },
                                    bids: {
                                      type: 'integer',
                                    },
                                    highest_bid: {
                                      type: 'integer',
                                    },
                                    total_fees: {
                                      type: 'integer',
                                    },
                                    gold_earned: {
                                      type: 'integer',
                                    },
                                    gold_spent: {
                                      type: 'integer',
                                    },
                                    sold: {
                                      type: 'object',
                                      properties: {
                                        rare: {
                                          type: 'integer',
                                        },
                                        epic: {
                                          type: 'integer',
                                        },
                                        uncommon: {
                                          type: 'integer',
                                        },
                                        legendary: {
                                          type: 'integer',
                                        },
                                        common: {
                                          type: 'integer',
                                        },
                                      },
                                    },
                                    bought: {
                                      type: 'object',
                                      properties: {
                                        rare: {
                                          type: 'integer',
                                        },
                                        uncommon: {
                                          type: 'integer',
                                        },
                                        epic: {
                                          type: 'integer',
                                        },
                                        legendary: {
                                          type: 'integer',
                                        },
                                        common: {
                                          type: 'integer',
                                        },
                                      },
                                    },
                                  },
                                },
                                winter_records: {
                                  type: 'object',
                                  properties: {
                                    snowballs_hit: {
                                      type: 'integer',
                                    },
                                    damage: {
                                      type: 'integer',
                                    },
                                    magma_cube_damage: {
                                      type: 'integer',
                                    },
                                    cannonballs_hit: {
                                      type: 'integer',
                                    },
                                  },
                                },
                                pet_milestones: {
                                  type: 'object',
                                  properties: {
                                    ore_mined: {
                                      type: 'integer',
                                    },
                                    sea_creatures_killed: {
                                      type: 'integer',
                                    },
                                  },
                                },
                              },
                            },
                            inventory: inventoryContainer,
                            armor: inventoryContainer,
                            talisman_bag: inventoryContainer,
                            fishing_bag: inventoryContainer,
                            potion_bag: inventoryContainer,
                            ender_chest: inventoryContainer,
                            candy_bag: inventoryContainer,
                            wardrobe: inventoryContainer,
                            last_save: {
                              type: 'integer',
                            },
                            first_join: {
                              type: 'integer',
                            },
                            coin_purse: {
                              type: 'integer',
                            },
                            fairy_souls_collected: {
                              type: 'integer',
                            },
                            fairy_souls: {
                              type: 'integer',
                            },
                            fairy_exchanges: {
                              type: 'integer',
                            },
                            pets: {
                              type: 'array',
                              items: [
                                {
                                  type: 'object',
                                  properties: {
                                    type: {
                                      type: 'string',
                                    },
                                    exp: {
                                      type: 'number',
                                    },
                                    active: {
                                      type: 'boolean',
                                    },
                                    tier: {
                                      type: 'string',
                                    },
                                    heldItem: {
                                      type: 'null',
                                    },
                                    candyUsed: {
                                      type: 'integer',
                                    },
                                  },
                                },
                              ],
                            },
                            skills: {
                              type: 'object',
                              properties: {
                                skill: {
                                  type: 'object',
                                  properties: {
                                    xp: {
                                      type: 'number',
                                    },
                                    level: {
                                      type: 'integer',
                                    },
                                    floatLevel: {
                                      type: 'number',
                                    },
                                    maxLevel: {
                                      type: 'integer',
                                    },
                                    xpCurrent: {
                                      type: 'integer',
                                    },
                                    xpForNext: {
                                      type: 'integer',
                                    },
                                    progress: {
                                      type: 'number',
                                    },
                                  },
                                },
                              },
                            },
                            average_skill_level: {
                              type: 'number',
                            },
                            collection: {
                              type: 'object',
                              properties: {
                                ITEM_ID: {
                                  type: 'integer',
                                },
                              },
                            },
                            collection_tiers: {
                              type: 'object',
                              properties: {
                                ITEM_ID: {
                                  type: 'integer',
                                },
                              },
                            },
                            collections_unlocked: {
                              type: 'integer',
                            },
                            minions: {
                              type: 'object',
                              properties: {
                                TYPE: {
                                  type: 'integer',
                                },
                              },
                            },
                            slayer: {
                              type: 'object',
                              properties: {
                                type: {
                                  type: 'object',
                                  properties: {
                                    claimed_levels: {
                                      type: 'integer',
                                    },
                                    xp: {
                                      type: 'integer',
                                    },
                                    xp_for_next: {
                                      type: 'integer',
                                    },
                                    kills_tier: {
                                      type: 'object',
                                      properties: {
                                        1: {
                                          type: 'integer',
                                        },
                                        2: {
                                          type: 'integer',
                                        },
                                        3: {
                                          type: 'integer',
                                        },
                                        4: {
                                          type: 'integer',
                                        },
                                        5: {
                                          type: 'integer',
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                            pet_score: {
                              type: 'integer',
                            },
                            bonuses: {
                              type: 'array',
                              items: [
                                {
                                  type: 'object',
                                  properties: {
                                    type: {
                                      type: 'string',
                                    },
                                    bonus: {
                                      type: 'object',
                                    },
                                  },
                                },
                              ],
                            },
                            player: {
                              type: 'object',
                              properties: {
                                uuid: {
                                  type: 'string',
                                },
                                username: {
                                  type: 'string',
                                },
                                first_login: {
                                  type: 'integer',
                                },
                                last_login: {
                                  type: 'integer',
                                },
                                level: {
                                  type: 'number',
                                },
                                achievement_points: {
                                  type: 'integer',
                                },
                                karma: {
                                  type: 'integer',
                                },
                                rank_formatted: {
                                  type: 'string',
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    banking: {
                      type: 'object',
                      properties: {
                        balance: {
                          type: 'number',
                        },
                        transactions: {
                          type: 'array',
                          items: [
                            {
                              type: 'object',
                              properties: {
                                amount: {
                                  type: 'integer',
                                },
                                timestamp: {
                                  type: 'integer',
                                },
                                action: {
                                  type: 'string',
                                },
                                initiator_name: {
                                  type: 'string',
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                    unlocked_minions: {
                      type: 'object',
                      properties: {
                        MINION_TYPE: {
                          type: 'integer',
                        },
                      },
                    },
                    cute_name: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/skyblock/profile/:player/:profile?',
        func: async (request, response, callback) => {
          try {
            const uuid = await getUUID(request.params.player);
            try {
              // TODO: Update when buildProfile changed
              const profile = await buildProfile(uuid, request.params.profile);
              try {
                const players = await populatePlayers(Object.keys(profile.members || {}).map((uuid) => ({ uuid })));
                players.forEach((player) => {
                  profile.members[player.profile.uuid].player = player.profile;
                });
                response.json(profile);
              } catch (error) {
                callback(error);
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
    '/counts': {
      get: {
        summary: 'Get network player counts',
        description: 'Returns information about player counts in each game',
        operationId: 'getCounts',
        tags: [
          'counts',
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {},
                },
              },
            },
          },
        },
        route: () => '/counts',
        func: async (_, response) => {
          try {
            response.json(await buildCounts());
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
