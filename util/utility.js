/* eslint-disable no-await-in-loop */
/**
 * Provides utility functions.
 * All functions should have external dependencies (DB, etc.) passed as parameters
 * */
const constants = require('hypixelconstants');
const { fromPromise } = require('universalify');
const urllib = require('url');
const { v4: uuidV4 } = require('uuid');
const moment = require('moment');
const wait = require('util').promisify(setTimeout);
const { createLogger, format, transports } = require('winston');
const got = require('got');
const config = require('../config');
const contributors = require('../CONTRIBUTORS');
const profileFields = require('../store/profileFields');

const logger = createLogger({
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
});
if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') logger.level = 'debug';

function betterFormatting(i) {
  if (typeof i !== 'string') {
    return (i);
  }
  return (i.replace(/Â§/g, '§').replace(/§/g, '&'));
}

function removeFormatting(i) {
  return i.replace(/§./g, '');
}

function removeDashes(i) {
  return (i.replace(/-/g, ''));
}

/*
* Get ratio of x from y. Returns 2 decimal places.
 */
function getRatio(x = 0, y = 0) {
  if (x === 0) {
    return 0;
  }
  if (y === 0) {
    return null;
  }
  return Number((x / y).toFixed(2));
}

/*
 * Gets the correct weekly statistic from the two oscillating
 * weekly fields.
 */
function getWeeklyStat(a, b) {
  const delta = new Date() - new Date(1417237200000);
  const numberWeeks = Math.floor(delta / 604800000);

  return numberWeeks % 2 === 0 ? a : b;
}

/*
 * Gets the correct monthly statistic from the two oscillating
 * monthly fields.
 */
function getMonthlyStat(a, b) {
  const start = new Date();
  const end = new Date(1417410000000);

  const diffYear = end.getFullYear() - start.getFullYear();
  const diffMonth = diffYear * 12 + end.getMonth() - start.getMonth();

  return diffMonth % 2 === 0 ? a : b;
}

function fromEntries(array) {
  return array.reduce((object, [key, value]) => {
    object[key] = value;
    return object;
  }, {});
}

/*
 * Pick certain keys from obj.
 *
 * Options:
 *    regexp: A regex object that the keys must pass.
 *        Defaults to .*
 *    filter: A function that is passed both the key
 *        and value, and returns a boolean. Defaults
 *        to (() => true).
 *    keyMap: A function that remaps all keys that
 *        pass the above two tests. Defaults to
 *        (key => key).
 *    valueMap: Same as keyMap, but for the values.
 */
function pickKeys(object, options) {
  const regexp = options.regexp || /.+/;
  const filter = options.filter || (() => true);
  const keyMap = options.keyMap || ((key) => key);
  const valueMap = options.valueMap || ((value) => value);

  return fromEntries(Object.entries(object)
    .filter(([key, value]) => regexp.test(key) && filter(key, value))
    .map(([key, value]) => [keyMap(key), valueMap(value)]));
}

/**
 * Converts minigames ID to standard name e.g. 3 => Walls
 */
function IDToStandardName(name = '') {
  const result = constants.game_types.find((game) => game.id === Number(name));
  return result === undefined ? name : result.standard_name;
}

/**
 * Converts minigames database name to standard name e.g. GingerBread => TKR
 */
function DBToStandardName(name = '') {
  const result = constants.game_types.find((game) => game.database_name.toLowerCase() === name.toLowerCase());
  return result === undefined ? name : result.standard_name;
}

/**
 * Converts minigames type to standard name e.g. QUAKECRAFT => Quake
 */
function typeToStandardName(name) {
  const result = constants.game_types.find((game) => game.type_name === name);
  return result === undefined ? name : result.standard_name;
}

/**
 * Converts minigame types into clean names e.g. TNTGAMES => TNT Games
 */
function typeToCleanName(name) {
  const result = constants.game_types.find((game) => game.type_name === name);
  return result === undefined ? name : result.clean_name;
}

/**
 * Determines if a player has contributed to the development of Slothpixel
 */
const isContributor = (uuid) => contributors.includes(uuid);

/**
 * Allows you to use dot syntax for nested objects, e.g. 'tag.value.display'
 */
function getNestedObjects(object = {}, path = '') {
  path = path.split('.');

  for (const element of path) {
    if (object[element] === undefined) {
      return object;
    }
    object = object[element];
  }
  return object;
}

/**
 * Returns specified+profile fields from a player objects
 */
function getPlayerFields(object = {}, fields = []) {
  const result = {};
  fields.concat(profileFields).forEach((field) => {
    result[field] = getNestedObjects(object, field);
  });
  return result;
}

/**
 * Returns the unix timestamp at the beginning of a block of n minutes
 * Offset controls the number of blocks to look ahead
 * */
function getStartOfBlockMinutes(size, offset = 0) {
  const blockS = size * 60;
  const currentTime = Math.floor(new Date() / 1000);
  const blockStart = currentTime - (currentTime % blockS);
  return (blockStart + (offset * blockS)).toFixed(0);
}

function getEndOfMonth() {
  return moment().endOf('month').unix();
}

function redisCount(redis, prefix) {
  const key = `${prefix}:${moment().startOf('hour').format('X')}`;
  redis.pfadd(key, uuidV4());
  redis.expireat(key, moment().startOf('hour').add(1, 'day').format('X'));
}

function getRedisCountDay(redis, prefix, callback) {
  // Get counts for last 24 hour keys (including current partial hour)
  const keyArray = [];
  for (let i = 0; i < 24; i += 1) {
    keyArray.push(`${prefix}:${moment().startOf('hour').subtract(i, 'hour').format('X')}`);
  }
  redis.pfcount(...keyArray, callback);
}

function getRedisCountHour(redis, prefix, callback) {
  // Get counts for previous full hour
  const keyArray = [];
  for (let i = 1; i < 2; i += 1) {
    keyArray.push(`${prefix}:${moment().startOf('hour').subtract(i, 'hour').format('X')}`);
  }
  redis.pfcount(...keyArray, callback);
}

const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

/**
 * Creates a job object for enqueueing that contains details such as the Hypixel endpoint to hit
 * See https://github.com/HypixelDev/PublicAPI/tree/master/Documentation/methods
 * */
function generateJob(type, payload) {
  logger.debug(`generateJob ${type}`);
  const apiUrl = 'https://api.hypixel.net';
  const apiKeys = config.HYPIXEL_API_KEY.split(',');
  const apiKey = randomItem(apiKeys);
  if (apiKey === '') {
    logger.warn('No HYPIXEL_API_KEY env variable set!');
  }
  const options = {
    bazaar_products() {
      return {
        url: `${apiUrl}/skyblock/bazaar`,
      };
    },
    boosters() {
      return {
        url: `${apiUrl}/boosters?key=${apiKey}`,
      };
    },
    counts() {
      return {
        url: `${apiUrl}/counts?key=${apiKey}`,
      };
    },
    guildByPlayer() {
      return {
        url: `${apiUrl}/guild?key=${apiKey}&player=${payload.id}`,
      };
    },
    guildByName() {
      return {
        url: `${apiUrl}/guild?key=${apiKey}&name=${payload.id}`,
      };
    },
    guildById() {
      return {
        url: `${apiUrl}/guild?key=${apiKey}&id=${payload.id}`,
      };
    },
    gamecounts() {
      return {
        url: `${apiUrl}/gamecounts?key=${apiKey}`,
      };
    },
    key() {
      return {
        url: `${apiUrl}/key?key=${apiKey}`,
      };
    },
    recentgames() {
      return {
        url: `${apiUrl}/recentGames?key=${apiKey}&uuid=${payload.id}`,
      };
    },
    skyblock_auctions() {
      return {
        url: `${apiUrl}/skyblock/auctions?page=${payload.page}`,
      };
    },
    skyblock_auctions_ended() {
      return {
        url: `${apiUrl}/skyblock/auctions_ended`,
      };
    },
    skyblock_profiles() {
      return {
        url: `${apiUrl}/skyblock/profiles?key=${apiKey}&uuid=${payload.id}`,
      };
    },
    skyblock_profile() {
      return {
        url: `${apiUrl}/skyblock/profile?key=${apiKey}&profile=${payload.id}`,
      };
    },
    skyblock_items() {
      return {
        url: `${apiUrl}/resources/skyblock/items`,
      };
    },
    status() {
      return {
        url: `${apiUrl}/status?key=${apiKey}&uuid=${payload.id}`,
      };
    },
    player() {
      return {
        url: `${apiUrl}/player?key=${apiKey}&uuid=${payload.id}`,
      };
    },
    watchdogstats() {
      return {
        url: `${apiUrl}/watchdogstats?key=${apiKey}`,
      };
    },

  };
  return options[type]();
}

/**
 * A wrapper around HTTPS requests that handles:
 * retries/retry delay
 * Injecting API key for Hypixel API
 * Errors from Hypixel API
 * */
const getData = fromPromise(async (redis, url) => {
  if (typeof url === 'string') {
    url = {
      url,
    };
  }

  url = {
    delay: Number(config.DEFAULT_DELAY),
    timeout: 5000,
    retries: 10,
    ...url,
  };

  const urlData = urllib.parse(url.url, true);
  const isHypixelApi = urlData.host === 'api.hypixel.net';
  const isMojangApi = urlData.host === 'ashcon.app';

  const target = urllib.format(urlData);

  logger.info(`getData: ${target}`);

  try {
    const { body } = await got(target, {
      responseType: 'json',
      timeout: url.timeout,
      retry: url.retries,
      hooks: {
        beforeRetry: [
          async () => {
            if (isHypixelApi) {
              const multi = redis.multi()
                .incr('hypixel_api_error')
                .expireat('hypixel_api_error', getStartOfBlockMinutes(1, 1));

              try {
                const [failed] = await multi.exec();
                logger.warn(`Failed API requests in the past minute: ${failed[1]}`);
              } catch (error) {
                logger.error(error);
              }
            }
            if (isMojangApi) {
              throw new Error('Failed to get player uuid');
            }
          },
        ],
      },
    });

    return body;
  } catch (error) {
    if (url.noRetry) {
      throw new Error('Invalid response');
    }
    if (error.response && error.response.statusCode) {
      switch (error.response.statusCode) {
        case 404:
          throw new Error('Player does not exist');
        default:
          logger.error(`[INVALID] error: ${error}`);
          throw new Error('An error occurred while getting the player UUID');
      }
    }
    logger.error(`[INVALID] error: ${error}`);
    throw new Error('Internal Server Error');
  }
});

function colorNameToCode(color) {
  if (!color) {
    return null;
  }
  const colors = new Map([
    ['black', 0],
    ['dark_blue', 1],
    ['dark_green', 2],
    ['dark_aqua', 3],
    ['dark_red', 4],
    ['dark_purple', 5],
    ['gold', 6],
    ['gray', 7],
    ['dark_gray', 8],
    ['blue', 9],
    ['green', 'a'],
    ['aqua', 'b'],
    ['red', 'c'],
    ['light_purple', 'd'],
    ['yellow', 'e'],
    ['white', 'f'],
    ['reset', 'r'],
  ]);
  return `&${colors.get(color.toLowerCase())}`;
}

function generateFormattedRank(rank, plusColor, prefix, plusPlusColor) {
  if (prefix) {
    return prefix;
  }
  const ranks = new Map([
    ['VIP', '&a[VIP]'],
    ['VIP_PLUS', '&a[VIP&6+&a]'],
    ['MVP', '&b[MVP]'],
    ['MVP_PLUS', `&b[MVP${plusColor}+&b]`],
    ['MVP_PLUS_PLUS', `${plusPlusColor}[MVP${plusColor}++${plusPlusColor}]`],
    ['HELPER', '&9[HELPER]'],
    ['MODERATOR', '&2[MOD]'],
    ['GAME_MASTER', '&2[GM]'],
    ['ADMIN', '&c[ADMIN]'],
    ['YOUTUBER', '&c[&fYOUTUBE&c]'],
  ]);
  return ranks.get(rank) || '&7';
}

function invokeInterval(func, delay) {
  // invokes the function immediately, waits for promise, waits the delay, and then calls it again
  (async function invoker() {
    logger.info(`[invokeInterval] Running ${func.name}`);
    const start = Date.now();
    try {
      await func();
    } catch (error) {
      // log the error, but wait until next interval to retry
      logger.error(error);
    }
    logger.info(`[invokeInterval] ${func.name}: ${Date.now() - start} ms`);
    setTimeout(invoker, delay);
  }());
}

/*
* Function to sync intervals with Hypixel API updates/caching
* Used by auctions and bazaar services
 */
async function syncInterval(test, fun, interval = 60000, retest = false) {
  let lastUpdated = await test();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let next = lastUpdated + interval;
    let waitMs = next - Date.now();
    while (waitMs < 0) {
      logger.debug('Cache persisting longer than 60 seconds! Waiting...');
      await wait(1000);
      lastUpdated = await test();
      next = lastUpdated + interval;
      waitMs = next - Date.now();
    }
    logger.info(`[syncInterval] waiting ${waitMs / 1000} seconds`);
    await wait(waitMs);
    const returned = await fun();
    lastUpdated = retest ? await test() : (returned || await test());
  }
}

function redisBulk(redis, command, keys, prefix, arguments_ = []) {
  const pipeline = redis.pipeline();
  keys.forEach((key) => {
    if (prefix) {
      key = `${prefix}:${key}`;
    }
    pipeline[command](key, ...arguments_);
  });
  return pipeline.exec();
}

function chunkArray(array, maxSize) {
  const output = [];
  for (let i = 0; i < array.length; i += maxSize) {
    output.push(array.slice(i, i + maxSize));
  }
  return output;
}

function nth(n) {
  return n + ['st', 'nd', 'rd'][((((n + 90) % 100) - 10) % 10) - 1] || `${n}th`;
}

module.exports = {
  logger,
  betterFormatting,
  removeFormatting,
  IDToStandardName,
  DBToStandardName,
  typeToStandardName,
  typeToCleanName,
  isContributor,
  getNestedObjects,
  getPlayerFields,
  generateJob,
  getData,
  getStartOfBlockMinutes,
  getEndOfMonth,
  redisCount,
  redisBulk,
  getRedisCountDay,
  getRedisCountHour,
  removeDashes,
  getRatio,
  colorNameToCode,
  generateFormattedRank,
  getWeeklyStat,
  getMonthlyStat,
  pickKeys,
  invokeInterval,
  syncInterval,
  fromEntries,
  chunkArray,
  nth,
};
