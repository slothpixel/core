/* eslint-disable consistent-return */
const async = require('async');
const redis = require('../store/redis');
const getUUID = require('../store/getUUID');
const buildPlayer = require('../store/buildPlayer');
const buildGuild = require('../store/buildGuild');
const buildBans = require('../store/buildBans');
const buildBoosters = require('../store/buildBoosters');
const leaderboards = require('../store/leaderboards');
const queryAuctions = require('../store/queryAuctions');
const { playerObject } = require('./objects');
const { cachePlayerProfile, getPlayerProfile, getMetadata } = require('../store/queries');
const {
  logger, getProfileFields, min, max, median, average, stdDev,
} = require('../util/utility');
const {
  playerNameParam, gameNameParam, typeParam, columnParam, filterParam, sortByParam,
  limitParam, significantParam, populatePlayersParam, templateParam, itemIdParam, itemIdParam2,
  fromParam, untilParam, auctionUUIDParam, itemUUIDParam, activeParam, pageParam,
} = require('./params');
const packageJson = require('../package.json');

function getPlayer(req, res, cb) {
  getUUID(req.params.player, (err, uuid) => {
    if (err) {
      return cb({ status: 404, message: err });
    }
    buildPlayer(uuid, (err, player) => {
      if (err) {
        return cb({ status: 500, message: err });
      }
      return cb(null, player);
    });
  });
}

function populatePlayers(players, cb) {
  async.map(players, (player, done) => {
    const { uuid } = player;
    getPlayerProfile(uuid, (err, profile, isCached) => {
      if (err) {
        logger.error(err);
      }
      if (profile === null) {
        logger.debug(`[populatePlayers] ${uuid} not found in DB, generating...`);
        buildPlayer(uuid, (err, newPlayer) => {
          delete player.uuid;
          const profile = getProfileFields(newPlayer);
          profile.uuid = uuid;
          player.profile = profile;
          cachePlayerProfile(profile, () => {
            done(err, player);
          });
        });
      } else {
        delete player.uuid;
        player.profile = profile;
        if (isCached) {
          done(err, player);
        } else {
          cachePlayerProfile(profile, () => {
            done(err, player);
          });
        }
      }
    });
  }, (err, result) => {
    cb(result);
  });
}

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
    description: 'The Slothpixel API provides Hypixel related data.\n',
    version: packageJson.version,
    title: 'Slothpixel API',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
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
      name: 'auctions',
      description: 'SkyBlock auction data',
    },
    {
      name: 'metadata',
      description: '',
    },
  ],
  paths: {
    '/players/{playerName}': {
      get: {
        tags: [
          'player',
        ],
        summary: 'Get player stats by name or uuid',
        description: 'Returns player stats',
        parameters: [
          playerNameParam,
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
        func: (req, res) => {
          getPlayer(req, res, (err, player) => {
            if (err) {
              return res.status(err.status).json({ error: err.message });
            }
            delete player.achievements;
            delete player.quests;
            return res.json(player);
          });
        },
      },
    },
    '/players/{playerName}/achievements': {
      get: {
        tags: [
          'player',
        ],
        summary: 'In-depth achievement stats',
        description: 'Returns player achievement stats',
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
        func: (req, res) => {
          getPlayer(req, res, (err, player) => {
            if (err) {
              return res.status(err.status).json({ error: err.message });
            }
            return res.json(player.achievements);
          });
        },
      },
    },
    '/players/{playerName}/quests': {
      get: {
        tags: [
          'player',
        ],
        summary: 'In-depth quest data',
        description: 'Returns player quest completions',
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
        func: (req, res) => {
          getPlayer(req, res, (err, player) => {
            if (err) {
              return res.status(err.status).json({ error: err.message });
            }
            return res.json(player.quests);
          });
        },
      },
    },
    /*
    '/profile/{playerName}': {
      get: {
        tags: [
          'player',
        ],
        summary: 'Get basic player info',
        description: 'Returns player stats',
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
                  type: 'object',
                  properties: {
                    uuid: {
                      description: 'Player uuid',
                      type: 'string',
                    },
                    username: {
                      description: 'Player username',
                      type: 'string',
                    },
                    first_login: {
                      description: 'First login date',
                      type: 'string',
                    },
                    level: {
                      description: 'Player level',
                      type: 'number',
                    },
                    achievement_points: {
                      description: 'Total achievement points',
                      type: 'integer',
                    },
                    karma: {
                      type: 'integer',
                    },
                    rank_formatted: {
                      description: 'Formatted rank string',
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
    */
    '/guilds/{playerName}': {
      get: {
        tags: [
          'guild',
        ],
        summary: 'Get guild stats by user\'s username or uuid',
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
        func: (req, res) => {
          getUUID(req.params.player, (err, uuid) => {
            if (err) {
              return res.status(404).json({ error: err });
            }
            buildGuild(uuid, (err, guild) => {
              if (err) {
                return res.status(404).json({ error: err });
              }
              if (req.query.populatePlayers !== undefined) {
                populatePlayers(guild.members, (players) => {
                  guild.members = players;
                  return res.json(guild);
                });
              } else {
                return res.json(guild);
              }
            });
          });
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
    '/skyblock/auctions': {
      get: {
        tags: [
          'auctions',
        ],
        summary: 'Query all skyblock auctions',
        description: 'Allows you to query all auctions and filter the results based on things such as item, rarity, enchantments or date.',
        parameters: [
          filterParam, limitParam, pageParam, activeParam, auctionUUIDParam, itemUUIDParam,
          itemIdParam2,
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
        func: (req, res) => {
          queryAuctions(req.query, (error, auctions) => {
            if (error) {
              return res.status(400).json({ error });
            }
            return res.json(auctions);
          });
        },
      },
    },
    '/skyblock/auctions/{itemId}': {
      get: {
        tags: [
          'auctions',
        ],
        summary: 'Query past skyblock auctions and their stats by item',
        description: 'Allows you to query past auctions for an item within specified time range. Also returns some statistical constants for this data.',
        parameters: [
          itemIdParam, fromParam, untilParam,
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
        func: (req, res, cb) => {
          const now = Date.now();
          const from = req.query.from || (now - 24 * 60 * 60 * 1000);
          const until = req.query.from || now;
          if (Number.isNaN(Number(from))) {
            return cb(res.status(400).json({ error: "parameter 'from' must be an integer" }));
          }
          redis.zrangebyscore(req.params.id, from, until, (err, auctions) => {
            if (err) {
              logger.error(err);
            }
            const obj = {
              average_price: 0,
              median_price: 0,
              standard_deviation: 0,
              min_price: 0,
              max_price: 0,
              sold: 0,
              auctions: {},
            };
            const priceArray = [];
            auctions.forEach((auction) => {
              auction = JSON.parse(auction);
              if (auction.bids.length > 0) priceArray.push(auction.highest_bid_amount / auction.item.count);
              obj.auctions[auction.end] = auction;
            });
            obj.average_price = average(priceArray);
            obj.median_price = median(priceArray);
            obj.standard_deviation = stdDev(priceArray);
            obj.min_price = min(priceArray);
            obj.max_price = max(priceArray);
            obj.sold = priceArray.length;
            return res.json(obj);
          });
        },
      },
    },
    '/leaderboards': {
      get: {
        tags: [
          'leaderboards',
        ],
        summary: 'Allows query of dynamic leaderboards',
        description: 'Returns player or guild leaderboards',
        parameters: [
          typeParam, columnParam, sortByParam, filterParam, limitParam, pageParam, significantParam,
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
        func: (req, res, cb) => {
          leaderboards(req.query, null, (error, lb) => {
            if (error) {
              return cb(res.status(400).json({ error }));
            }
            return res.json(lb);
          });
        },
      },
    },
    '/leaderboards/{template}': {
      get: {
        tags: [
          'leaderboards',
        ],
        summary: 'Get predefined leaderboards',
        description: 'Choose a predefined leaderboard, e.g. "general_level". Possible options can be retrieved from /metadata endpoint.',
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
        func: (req, res, cb) => {
          leaderboards(req.query, req.params.template, (error, lb) => {
            if (error) {
              return cb(res.status(400).json({ error }));
            }
            return res.json(lb);
          });
        },
      },
    },
    '/boosters': {
      get: {
        tags: [
          'boosters',
        ],
        summary: 'Get list of network boosters',
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
        func: (req, res) => {
          buildBoosters((err, boosters) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            return res.json(boosters);
          });
        },
      },
    },
    '/boosters/{game}': {
      get: {
        tags: [
          'boosters',
        ],
        summary: 'Get boosters for a specified game',
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
        func: (req, res) => {
          const { game } = req.params;
          buildBoosters((err, boosters) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            if (!Object.hasOwnProperty.call(boosters.boosters, game)) {
              return res.status(400).json({ error: 'Invalid minigame name!' });
            }
            return res.json(boosters.boosters[game]);
          });
        },
      },
    },
    '/bans': {
      get: {
        tags: [
          'bans',
        ],
        description: 'Get watchdog and staff bans',
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
        func: (req, res) => {
          buildBans((err, bans) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            return res.json(bans);
          });
        },
      },
    },
    '/metadata': {
      get: {
        summary: 'GET /metadata',
        description: 'Site metadata',
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
        func: (req, res, cb) => {
          getMetadata(req, (err, result) => {
            if (err) {
              return cb(err);
            }
            return res.json(result);
          });
        },
      },
    },
    '/health': {
      get: {
        summary: 'GET /health',
        description: 'Get service health data',
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
        func: (req, res, cb) => {
          redis.hgetall('health', (err, result) => {
            if (err) {
              return cb(err);
            }
            const response = result || {};
            Object.keys(response).forEach((key) => {
              response[key] = JSON.parse(response[key]);
            });
            if (!req.params.metric) {
              return res.json(response);
            }
            const single = response[req.params.metric];
            const healthy = single.metric < single.threshold;
            return res.status(healthy ? 200 : 500).json(single);
          });
        },
      },
    },
  },
};
module.exports = spec;
