/* eslint-disable consistent-return */
const async = require('async');
const pify = require('pify');
const config = require('../config');
const processPlayerData = require('../processors/processPlayerData');
const getUUID = require('./get-uuid');
const {
  logger, generateJob, getData, getPlayerFields,
} = require('../util/utility');
const redis = require('./redis');
const cacheFunctions = require('./cacheFunctions');
const queries = require('./queries');

/*
* Functions to build/cache player object
* Currently doesn't support search by name
 */
function getPlayerData(uuid, cb) {
  const { url } = generateJob('player', {
    id: uuid,
  });
  getData(redis, url, (err, body) => {
    if (err) {
      return cb(err.message, null);
    }
    processPlayerData(body.player || {}, (player) => cb(null, player));
  });
}

function cachePlayer(player, uuid, key, caching, cb) {
  if (caching.cacheResult === false) return cb(player);
  if (config.ENABLE_PLAYER_CACHE) {
    cacheFunctions.write({
      key,
      duration: config.PLAYER_CACHE_SECONDS,
    }, player);
  }
  if (config.ENABLE_DB_CACHE) {
    queries.insertPlayer(uuid, player, (err) => {
      if (err) {
        logger.error(err);
      }
    });
  }
  return cb(player);
}

function buildPlayer(uuid, cb) {
  let u;
  const caching = uuid.caching || {};
  if (typeof uuid === 'object') {
    u = uuid.uuid;
  } else {
    u = uuid;
  }
  const key = `player:${u}`;
  cacheFunctions.read({ key }, (player) => {
    if (player) {
      logger.debug(`Cache hit for player ${u}`);
      return cb(null, player);
    }
    getPlayerData(u, (err, player) => {
      if (err) {
        return cb(err);
      }
      cachePlayer(player, u, key, caching, (player) => cb(null, player));
    });
  });
}

function getPlayer(name, cb) {
  getUUID(name).then((uuid) => {
    buildPlayer(uuid, (err, player) => {
      if (err) {
        return cb({ status: 500, message: err });
      }
      return cb(null, player);
    });
  }).catch((err) => {
    cb({ status: 404, message: err });
  });
}

async function populatePlayers(players) {
  return async.map(players, async (player) => {
    const { uuid } = player;
    try {
      const [profile, isCached] = pify(queries.getPlayerProfile, {
        multiArgs: true,
      })(uuid);
      if (profile === null) {
        logger.debug(`[populatePlayers] ${uuid} not found in DB, generating...`);
        const newPlayer = await pify(buildPlayer)();
        delete player.uuid;
        const profile = getPlayerFields(newPlayer);
        profile.uuid = uuid;
        player.profile = profile;
        await pify(queries.cachePlayerProfile)(profile);
        return player;
      }
      delete player.uuid;
      player.profile = profile;
      if (isCached) {
        return player;
      }
      await pify(queries.cachePlayerProfile)(profile);
      return player;
    } catch (error) {
      logger.error(error);
    }
  });
}

module.exports = { buildPlayer, getPlayer, populatePlayers };
