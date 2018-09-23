/* eslint-disable max-len, no-shadow */
const getUUID = require('../store/getUUID');
const buildPlayer = require('../store/buildPlayer');
const buildGuild = require('../store/buildGuild');
const buildBans = require('../store/buildBans');
const { playerNameParam } = require('./params');
const packageJson = require('../package.json');

const spec = {
  openapi: '3.0.0',
  servers: [
    {
      url: 'https://api.slothpixel.me/api',
    },
  ],
  info: {
    description: 'The Slothpixel API provides Hypixel related data.\n',
    version: packageJson,
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
      name: 'friends',
      description: 'Player friends',
    },
    {
      name: 'session',
      description: 'Player session',
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
  ],
  paths: {
    '/player/{playerName}': {
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
                    online: {
                      description: 'Is player online',
                      type: 'boolean',
                    },
                    rank: {
                      description: 'Player rank',
                      type: 'string',
                    },
                    rank_plus_color: {
                      description: 'Color code for MVP+(+)',
                      type: 'string',
                      'x-default_value': '&c',
                    },
                    rank_formatted: {
                      description: 'Formatted rank string',
                      type: 'string',
                    },
                    prefix: {
                      description: 'Custom rank prefix',
                      type: 'string',
                    },
                    level: {
                      description: 'Player level with precision of two decimals',
                      type: 'number',
                    },
                    karma: {
                      description: 'Player karma',
                      type: 'integer',
                    },
                    total_coins: {
                      description: 'Total coins across all minigames',
                      type: 'integer',
                    },
                    total_kills: {
                      description: 'Total kills across all minigames',
                      type: 'integer',
                    },
                    total_wins: {
                      description: 'Total wins across all minigames',
                      type: 'integer',
                    },
                    mc_version: {
                      description: 'Minecraft version the user last logged on Hypixel with',
                      type: 'string',
                    },
                    first_login: {
                      description: 'Date of first Hypixel login',
                      type: 'string',
                    },
                    last_login: {
                      description: 'Date of latest Hypixel login',
                      type: 'string',
                    },
                    last_game: {
                      description: 'Latest minigame played',
                      type: 'string',
                    },
                    rewards: {
                      description: 'Daily reward data',
                      type: 'object',
                      properties: {
                        streak_current: {
                          description: 'Current streak',
                          type: 'integer',
                        },
                        streak_best: {
                          description: 'Best streak',
                          type: 'integer',
                        },
                        claimed: {
                          description: 'Total reards claimed',
                          type: 'integer',
                        },
                        claimed_daily: {
                          description: 'Daily rewards claimed',
                          type: 'integer',
                        },
                        tokens: {
                          description: 'Current reward tokens',
                          type: 'integer',
                        },
                      },
                    },
                    links: {
                      description: 'Social media links',
                      type: 'object',
                      properties: {
                        twitter: {
                          description: 'Twitter link',
                          type: 'string',
                        },
                        youtube: {
                          description: 'YouTube link',
                          type: 'string',
                        },
                        instagram: {
                          description: 'Instagram link',
                          type: 'string',
                        },
                        twitch: {
                          description: 'Twitch link',
                          type: 'string',
                        },
                        mixer: {
                          description: 'Mixer link',
                          type: 'string',
                        },
                        discord: {
                          description: 'Discord handle',
                          type: 'string',
                        },
                        hypixel: {
                          description: 'Hypixel forums profile link',
                          type: 'string',
                        },
                      },
                    },
                    stats: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/player/:player',
        func: (req, res, cb) => {
          getUUID(req.params.player, (err, uuid) => {
            if (err) {
              cb();
            }
            buildPlayer(uuid, (err, player) => {
              if (err) {
                cb();
              }
              return res.json(player);
            });
          });
        },
      },
    },
    /*
    '/player/{playerName}/achievements': {
      get: {
        tags: [
          'player',
        ],
        summary: 'In-depth achievement stats',
        description: 'Returns player achievement stats',
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
                    achievement_points: {
                      type: 'integer',
                      description: 'Total achievement points',
                    },
                    game: {
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
      },
    },
    '/player/{playerName}/quests': {
      get: {
        tags: [
          'player',
        ],
        summary: 'In-depth quest data',
        description: 'Returns player quest completions',
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
                    quests_completed: {
                      type: 'integer',
                      description: 'Total quests completed',
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
      },
    },
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
    '/guild/{playerName}': {
      get: {
        tags: [
          'guild',
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
                      type: 'number',
                    },
                    discord: {
                      description: 'Link to guild discord',
                      type: 'string',
                    },
                    description: {
                      type: 'string',
                    },
                    preferred_games: {
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
                            type: 'number',
                          },
                          coins: {
                            description: 'Guild coins earned this week',
                            type: 'number',
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
        route: () => '/guild/:player',
        func: (req, res, cb) => {
          getUUID(req.params.player, (err, uuid) => {
            if (err) {
              cb();
            }
            buildGuild(uuid, (err, guild) => {
              if (err) {
                cb();
              }
              return res.json(guild);
            });
          });
        },
      },
    },
    /*
    '/session/{playerName}': {
      get: {
        tags: [
          'session',
        ],
        summary: 'Get guild stats by user\'s username or uuid',
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
                          originalLenght: {
                            description: 'Original duration in seconds',
                            type: 'integer',
                          },
                          lenght: {
                            description: 'Current lenght in seconds',
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
                      originalLenght: {
                        description: 'Original duration in seconds',
                        type: 'integer',
                      },
                      lenght: {
                        description: 'Current lenght in seconds',
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
    */
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
        func: (req, res, cb) => {
          buildBans((err, bans) => {
            if (err) {
              cb();
            }
            return res.json(bans);
          });
        },
      },
    },
  },
};
module.exports = spec;
