/**
 * Provides utility functions.
 * All functions should have external dependencies (DB, etc.) passed as parameters
 * */
const constants = require('hypixelconstants');
const request = require('request');
const urllib = require('url');
const config = require('../config');

function betterFormatting(i) {
  if (typeof i !== 'string') {
    return (i);
  }
  return (i.replace(/Â§/g, '§').replace(/§/g, '&'));
}

function removeDashes(i) {
  return (i.replace(/-/g, ''));
}

/**
 * Converts minigame's ID to standard name e.g. GingerBread => TKR
 */
function IDToStandardName(name) {
  return constants.game_types.find(game => game.id === Number(name)).standard_name;
}

/**
 * Converts minigame's database name to standard name e.g. 3 => Walls
 */
function DBToStandardName(name) {
  return constants.game_types.find(game => game.database_name === name).standard_name;
}

/**
 * Creates a job object for enqueueing that contains details such as the Hypixel endpoint to hit
 * See https://github.com/HypixelDev/PublicAPI/tree/master/Documentation/methods
 * */
function generateJob(type, payload) {
  const apiUrl = 'https://api.hypixel.net';
  const apiKey = config.HYPIXEL_API_KEY;
  const opts = {
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
    key() {
      return {
        url: `${apiUrl}/key?key=${apiKey}`,
      };
    },
    session() {
      return {
        url: `${apiUrl}/session?key=${apiKey}&uuid=${payload.id}`,
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
 *
 *
 * */
function getData(url, cb) {
  let u;
  if (typeof url === 'object' && url && url.url) {
    u = url.url;
  } else {
    u = url;
  }
  const parse = urllib.parse(u, true);
  const hypixelApi = parse.host === 'api.hypixel.net';
  const mojangApi = parse.host === 'api.mojang.com';
  const target = urllib.format(parse);
  return request({
    url: target,
    json: hypixelApi,
  }, (err, res, body) => {
    if (err
      || !res
      || res.statusCode !== 200
      || !body
    ) {
      console.error('[INVALID] status');
      return cb('Request failed', null);
    } if (hypixelApi && !body.success) {
      console.error(`[Hypixel API Error]: ${body.cause}`);
      return cb(`${body.cause}`, null);
    } if (mojangApi && body.error) {
      console.error(`[Mojang API Error]: ${body.error} : ${body.errorMessage}`);
      return cb(`${body.error} : ${body.errorMessage}`, null);
    }
    return cb(null, body);
  });
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

function generateFormattedRank(rank, plusColor, prefix) {
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
      return `&6[MVP${plusColor}++&6]`;
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

module.exports = {
  betterFormatting,
  IDToStandardName,
  DBToStandardName,
  generateJob,
  getData,
  removeDashes,
  colorNameToCode,
  generateFormattedRank,
};
