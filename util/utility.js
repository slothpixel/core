/**
 * Provides utility functions.
 * All functions should have external dependencies (DB, etc.) passed as parameters
 * */
const constants = require('hypixelconstants');
const request = require('request');
const urllib = require('url');
const uuidV4 = require('uuid/v4');
const moment = require('moment');
const nbt = require('prismarine-nbt');
const { createLogger, format, transports } = require('winston');
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
* Decode SkyBlock inventory data
 */
function decodeData(string, cb) {
  const data = Buffer.from(string, 'base64');
  nbt.parse(data, (err, json) => {
    if (err) {
      logger.error(err);
    }
    return cb(err, json);
  });
}

/*
 * Gets the correct weekly statistic from the two oscillating
 * weekly fields.
 */
function getWeeklyStat(a, b) {
  const delta = new Date() - new Date(1417237200000);
  const numWeeks = Math.floor(delta / 604800000);

  return numWeeks % 2 === 0 ? a : b;
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
function pickKeys(obj, options) {
  const regexp = options.regexp || /.+/;
  const filter = options.filter || (() => true);
  const keyMap = options.keyMap || ((key) => key);
  const valueMap = options.valueMap || ((value) => value);

  return Object.entries(obj)
    .filter(([key, value]) => regexp.test(key) && filter(key, value))
    .map(([key, value]) => [keyMap(key), valueMap(value)])
    .reduce((prev, [key, value]) => ({ ...prev, [key]: value }), {});
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
 * Determines if a player has contributed to the development of Slothpixel
 */
function isContributor(uuid) {
  return uuid in contributors;
}

/**
* Allows you to use dot syntax for nested objects, e.g. 'tag.value.display'
 */
function getNestedObjects(obj = {}, path = '') {
  path = path.split('.');
  for (let i = 0; i < path.length; i += 1) {
    if (obj[path[i]] === undefined) {
      break;
    }
    obj = obj[path[i]];
  }
  return obj;
}

/**
* Returns specified+profile fields from a player object
 */
function getPlayerFields(obj = {}, fields = []) {
  const res = {};
  fields.concat(profileFields).forEach((field) => {
    res[field] = getNestedObjects(obj, field);
  });
  return res;
}

/**
 * Returns the unix timestamp at the beginning of a block of n minutes
 * Offset controls the number of blocks to look ahead
 * */
function getStartOfBlockMinutes(size, offset = 0) {
  const blockS = size * 60;
  const curTime = Math.floor(new Date() / 1000);
  const blockStart = curTime - (curTime % blockS);
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

function getRedisCountDay(redis, prefix, cb) {
  // Get counts for last 24 hour keys (including current partial hour)
  const keyArr = [];
  for (let i = 0; i < 24; i += 1) {
    keyArr.push(`${prefix}:${moment().startOf('hour').subtract(i, 'hour').format('X')}`);
  }
  redis.pfcount(...keyArr, cb);
}

function getRedisCountHour(redis, prefix, cb) {
  // Get counts for previous full hour
  const keyArr = [];
  for (let i = 1; i < 2; i += 1) {
    keyArr.push(`${prefix}:${moment().startOf('hour').subtract(i, 'hour').format('X')}`);
  }
  redis.pfcount(...keyArr, cb);
}

/**
 * Creates a job object for enqueueing that contains details such as the Hypixel endpoint to hit
 * See https://github.com/HypixelDev/PublicAPI/tree/master/Documentation/methods
 * */
function generateJob(type, payload) {
  logger.debug(`generateJob ${type}`);
  const apiUrl = 'https://api.hypixel.net';
  const apiKeys = config.HYPIXEL_API_KEY.split(',');
  const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
  if (apiKey === '') {
    logger.warn('No HYPIXEL_API_KEY env variable set!');
  }
  const opts = {
    bazaar_products() {
      return {
        url: `${apiUrl}/skyblock/bazaar/products?key=${apiKey}`,
      };
    },
    bazaar_product() {
      return {
        url: `${apiUrl}/skyblock/bazaar/product?key=${apiKey}&productId=${payload.id}`,
      };
    },
    boosters() {
      return {
        url: `${apiUrl}/boosters?key=${apiKey}`,
      };
    },
    findguild() {
      return {
        url: `${apiUrl}/findguild?key=${apiKey}&byUuid=${payload.id}`,
      };
    },
    friends() {
      return {
        url: `${apiUrl}/friends?key=${apiKey}&uuid=${payload.id}`,
      };
    },
    guild() {
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
        url: `${apiUrl}/skyblock/auctions?key=${apiKey}&page=${payload.page}`,
      };
    },
    skyblock_profile() {
      return {
        url: `${apiUrl}/skyblock/profile?key=${apiKey}&profile=${payload.id}`,
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
  return opts[type]();
}

/**
 * A wrapper around HTTPS requests that handles:
 * retries/retry delay
 * Injecting API key for Hypixel API
 * Errors from Hypixel API
 * */
function getData(redis, url, cb) {
  let u;
  let delay = Number(config.DEFAULT_DELAY);
  let timeout = 20000;
  if (typeof url === 'object' && url && url.url) {
    u = url.url;
    delay = url.delay || delay;
    timeout = url.timeout || timeout;
  } else {
    u = url;
  }
  const parse = urllib.parse(u, true);
  const hypixelApi = parse.host === 'api.hypixel.net';
  const mojangApi = parse.host === 'api.mojang.com';
  const target = urllib.format(parse);
  logger.info(`getData: ${target}`);
  return setTimeout(() => {
    request({
      url: target,
      json: hypixelApi,
      timeout,
    }, (err, res, body) => {
      if (err
        || !res
        || res.statusCode !== 200
        || !body
        || (hypixelApi && !body.success)
      ) {
        // invalid response
        if (url.noRetry) {
          return cb('invalid response');
        }
        if (mojangApi) {
          return cb('Failed to get player uuid', null);
        }
        if (body) {
          logger.error(`[INVALID] error: ${body.cause}, retrying ${target}`);
          if (body.cause === 'Internal error') {
            return cb('Internal error');
          }
        } else {
          logger.error(`[INVALID] status: ${res ? res.statusCode : ''}, retrying ${target}`);
        }
        return getData(redis, url, cb);
      }
      if (hypixelApi && !body.success) {
        // valid response, but invalid data, retry
        if (url.noRetry) {
          return cb('invalid data');
        }
        // insert errors to redis for monitoring
        let failed = 0;
        const multi = redis.multi()
          .incr('hypixel_api_error')
          .expireat('hypixel_api_error', getStartOfBlockMinutes(1, 1));
        multi.exec((err, resp) => {
          if (err) {
            logger.error(err);
          }
          [failed] = resp;
          logger.warn(`Failed API requests in the past minute: ${failed}`);
          logger.error(`[INVALID] data: ${target}, retrying ${JSON.stringify(body)}`);
          let backoff = (body.throttle)
            ? 3000
            : 0;
          backoff += (failed > 50)
            ? 10 * failed
            : 0;
          logger.debug(`getData timout for ${backoff}ms`);
          return setTimeout(() => {
            getData(redis, url, cb);
          }, backoff);
        });
      }
      return cb(null, body);
    });
  }, delay);
}

function colorNameToCode(color) {
  if (color === null) {
    return (null);
  }
  switch (color.toLowerCase()) {
    case 'gray':
      return ('&7');
    case 'red':
      return ('&c');
    case 'green':
      return ('&a');
    case 'aqua':
      return ('&b');
    case 'gold':
      return ('&6');
    case 'light_purple':
      return ('&d');
    case 'yellow':
      return ('&e');
    case 'white':
      return ('&f');
    case 'blue':
      return ('&9');
    case 'dark_green':
      return ('&2');
    case 'dark_red':
      return ('&4');
    case 'dark_aqua':
      return ('&3');
    case 'dark_purple':
      return ('&5');
    case 'dark_gray':
      return ('&8');
    case 'black':
      return ('&0');
    default:
      return (null);
  }
}

function generateFormattedRank(rank, plusColor, prefix, plusPlusColor) {
  if (prefix) {
    return prefix;
  }
  switch (rank) {
    case 'VIP':
      return '&a[VIP]';
    case 'VIP_PLUS':
      return '&a[VIP&6+&a]';
    case 'MVP':
      return '&b[MVP]';
    case 'MVP_PLUS':
      return `&b[MVP${plusColor}+&b]`;
    case 'MVP_PLUS_PLUS':
      return `${plusPlusColor}[MVP${plusColor}++${plusPlusColor}]`;
    case 'HELPER':
      return '&9[HELPER]';
    case 'MODERATOR':
      return '&2[MOD]';
    case 'ADMIN':
      return '&c[ADMIN]';
    case 'YOUTUBER':
      return '&c[&fYOUTUBER&c]';
    default:
      return '&7';
  }
}

function invokeInterval(func, delay) {
  // invokes the function immediately, waits for callback, waits the delay, and then calls it again
  (function invoker() {
    logger.info(`running ${func.name}`);
    const start = Date.now();
    return func((err) => {
      if (err) {
        // log the error, but wait until next interval to retry
        logger.error(err);
      }
      logger.info(`${func.name}: ${Date.now() - start}ms`);
      setTimeout(invoker, delay);
    });
  }());
}

/**
 * Finds the max of the input array
 * */
function max(array) {
  return Math.max.apply(null, array);
}

/**
 * Finds the min of the input array
 * */
function min(array) {
  return Math.min.apply(null, array);
}

/**
 * Finds the arithmetic mean of the input array
 * */
function average(data) {
  return Math.floor((data.reduce(
    (a, b) => a + b,
    0,
  ) / data.length));
}

/**
 * Finds the standard deviation of the input array
 * */
function stdDev(data) {
  const avg = average(data);
  const squareDiffs = data.map((value) => {
    const diff = value - avg;
    const sqrDiff = diff * diff;
    return sqrDiff;
  });
  const avgSquareDiff = average(squareDiffs);
  const stdDev = Math.sqrt(avgSquareDiff);
  return Math.floor(stdDev);
}

/**
 * Finds the median of the input array
 * */
function median(data) {
  data.sort((a, b) => a - b);
  const half = Math.floor(data.length / 2);
  if (data.length % 2) {
    return data[half];
  }
  return Math.floor((data[half - 1] + data[half]) / 2.0);
}

module.exports = {
  logger,
  betterFormatting,
  removeFormatting,
  IDToStandardName,
  DBToStandardName,
  typeToStandardName,
  isContributor,
  getNestedObjects,
  getPlayerFields,
  generateJob,
  getData,
  getStartOfBlockMinutes,
  getEndOfMonth,
  redisCount,
  getRedisCountDay,
  getRedisCountHour,
  removeDashes,
  getRatio,
  decodeData,
  colorNameToCode,
  generateFormattedRank,
  getWeeklyStat,
  getMonthlyStat,
  pickKeys,
  invokeInterval,
  min,
  max,
  average,
  stdDev,
  median,
};
