const getUUID = require('../store/getUUID');
const buildPlayer = require('../store/buildPlayer');
const buildGuild = require('../store/buildGuild');
const buildBans = require('../store/buildBans');
const buildBoosters = require('../store/buildBoosters');
const buildSession = require('../store/buildSession');
const leaderboards = require('../store/leaderboards');
const {
  playerNameParam, gameNameParam, typeParam, columnParam, filterParam, sortByParam, limitParam, significantParam,
} = require('./params');
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
                      description: 'Player stats across all minigames',
                      type: 'object',
                      properties: {
                        Arcade: {
                          description: 'Player stats in the Arcade Games',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Coins in the Arcade Games',
                              type: 'integer',
                            },
                          },
                        },
                        Arena: {
                          description: 'Player stats in Arena Brawl',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins',
                              type: 'integer',
                            },
                            coins_spent: {
                              description: 'Total coins spent in Arena Brawl',
                              type: 'integer',
                            },
                            hat: {
                              description: 'Selected hat',
                              type: 'string',
                            },
                            penalty: {
                              type: 'integer',
                            },
                            magical_chest: {
                              type: 'integer',
                            },
                            keys: {
                              description: 'Current number of Magical Chest keys',
                              type: 'integer',
                            },
                            selected_sword: {
                              type: 'string',
                            },
                            active_rune: {
                              type: 'string',
                            },
                            skills: {
                              type: 'object',
                            },
                            combat_levels: {
                              type: 'object',
                            },
                            rune_levels: {
                              type: 'object',
                            },
                            gamemodes: {
                              description: 'Stats in specific Arena gamemodes',
                              type: 'object',
                              properties: {
                                one_v_one: {
                                  description: 'Specific stats in 1v1 Arena',
                                  type: 'object',
                                  properties: {
                                    damage: {
                                      description: 'Total damage dealt in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    kills: {
                                      description: 'Total kills in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    deaths: {
                                      description: 'Total deaths in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    losses: {
                                      description: 'Total losses in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    wins: {
                                      description: 'Total wins in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    win_streaks: {
                                      description: 'Highest win streak in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    games: {
                                      description: 'Total games played in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    healed: {
                                      description: 'Total health healed in 1v1 Arena',
                                      type: 'integer',
                                    },
                                    kd: {
                                      description: 'Kill/death ratio in 1v1 Arena',
                                      type: 'number',
                                    },
                                    win_loss: {
                                      description: 'Win/loss ratio in 1v1 Arena',
                                      type: 'number',
                                    },
                                    win_percentage: {
                                      description: 'Win percentage out of games played in 1v1 Arena',
                                      type: 'number',
                                    },
                                  },
                                },
                                two_v_two: {
                                  description: 'Specific stats in 2v2 Arena',
                                  type: 'object',
                                  properties: {
                                    damage: {
                                      description: 'Total damage dealt in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    kills: {
                                      description: 'Total kills in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    deaths: {
                                      description: 'Total deaths in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    losses: {
                                      description: 'Total losses in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    wins: {
                                      description: 'Total wins in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    win_streaks: {
                                      description: 'Highest win streak in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    games: {
                                      description: 'Total games played in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    healed: {
                                      description: 'Total health healed in 2v2 Arena',
                                      type: 'integer',
                                    },
                                    kd: {
                                      description: 'Kill/death ratio in 2v2 Arena',
                                      type: 'number',
                                    },
                                    win_loss: {
                                      description: 'Win/loss ratio in 2v2 Arena',
                                      type: 'number',
                                    },
                                    win_percentage: {
                                      description: 'Win percentage out of games played in 2v2 Arena',
                                      type: 'number',
                                    },
                                  },
                                },
                                four_v_four: {
                                  description: 'Specific stats in 4v4 Arena',
                                  type: 'object',
                                  properties: {
                                    damage: {
                                      description: 'Total damage dealt in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    kills: {
                                      description: 'Total kills in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    deaths: {
                                      description: 'Total deaths in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    losses: {
                                      description: 'Total losses in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    wins: {
                                      description: 'Total wins in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    win_streaks: {
                                      description: 'Highest win streak in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    games: {
                                      description: 'Total games played in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    healed: {
                                      description: 'Total health healed in 4v4 Arena',
                                      type: 'integer',
                                    },
                                    kd: {
                                      description: 'Kill/death ratio in 4v4 Arena',
                                      type: 'number',
                                    },
                                    win_loss: {
                                      description: 'Win/loss ratio in 4v4 Arena',
                                      type: 'number',
                                    },
                                    win_percentage: {
                                      description: 'Win percentage out of games played in 4v4 Arena',
                                      type: 'number',
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        Battleground: {
                          description: 'Player stats in Warlords',
                          type: 'object',
                          properties: {
                            coins: {
                              description: 'Current coins in Warlords',
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
        route: () => '/players/:player',
        func: (req, res, cb) => {
          getUUID(req.params.player, (err, uuid) => {
            if (err) {
              cb();
            }
            buildPlayer(uuid, (err, player) => {
              if (err) {
                cb();
              }
              delete player.achievements;
              delete player.quests;
              return res.json(player);
            });
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
        route: () => '/players/:player/achievements',
        func: (req, res, cb) => {
          getUUID(req.params.player, (err, uuid) => {
            if (err) {
              cb();
            }
            buildPlayer(uuid, (err, player) => {
              if (err) {
                cb();
              }
              return res.json(player.achievements);
            });
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
        func: (req, res, cb) => {
          getUUID(req.params.player, (err, uuid) => {
            if (err) {
              cb();
            }
            buildPlayer(uuid, (err, player) => {
              if (err) {
                cb();
              }
              return res.json(player.quests);
            });
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
                      description: 'Guild level',
                      type: 'number',
                    },
                    discord: {
                      description: 'Link to guild discord',
                      type: 'string',
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
        route: () => '/guilds/:player',
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
        func: (req, res, cb) => {
          getUUID(req.params.player, (err, uuid) => {
            if (err) {
              cb();
            }
            buildSession(uuid, (err, session) => {
              if (err) {
                cb();
              }
              return res.json(session);
            });
          });
        },
      },
    },
    /*
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
    '/leaderboards': {
      get: {
        tags: [
          'leaderboards',
        ],
        summary: 'Allows query of dynamic leaderboards',
        description: 'Returns player or guild leaderboards',
        parameters: [
          typeParam, columnParam, sortByParam, filterParam, limitParam, significantParam,
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

                    },
                  },
                },
              },
            },
          },
        },
        route: () => '/leaderboards',
        func: (req, res, cb) => {
          leaderboards(req.query, (error, lb) => {
            if (error) {
              return cb(res.json({ error }));
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
        func: (req, res, cb) => {
          buildBoosters((err, boosters) => {
            if (err) {
              cb();
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
        func: (req, res, cb) => {
          const { game } = req.params;
          buildBoosters((err, boosters) => {
            if (err) {
              cb();
            }
            if (!Object.hasOwnProperty.call(boosters.boosters, game)) {
              cb();
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
