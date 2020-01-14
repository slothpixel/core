/* eslint-disable consistent-return */
const config = require('../config');
const processPlayerData = require('../processors/processPlayerData');
const { logger, generateJob, getData } = require('../util/utility');
const redis = require('../store/redis');
const queries = require('../store/queries');

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
      return cb(err, null);
    }
    processPlayerData(body.player || {}, player => cb(null, player));
  });
}

function cachePlayer(player, uuid, key, caching, cb) {
  if (caching.cacheResult === false) return cb(player);
  if (config.ENABLE_PLAYER_CACHE) {
    redis.setex(key, config.PLAYER_CACHE_SECONDS, JSON.stringify(player), (err) => {
      if (err) {
        logger.error(err);
      }
    });
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
  redis.get(key, (err, reply) => {
    if (err) {
      return cb(err);
    } if (reply) {
      logger.debug(`Cache hit for player ${u}`);
      const player = JSON.parse(reply);
      return cb(null, player);
    }
    getPlayerData(u, (err, player) => {
      if (err) {
        return cb(err);
      }
      cachePlayer(player, u, key, caching, player => cb(null, player));
    });
  });
}

module.exports = buildPlayer;
