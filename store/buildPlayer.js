/* eslint-disable consistent-return */
const async = require('async');
const config = require('../config');
const processPlayerData = require('../processors/processPlayerData');
const getUUID = require('./getUUID');
const { logger, generateJob, getData } = require('../util/utility');
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
      return cb(err, null);
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
  getUUID(name, (err, uuid) => {
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
    queries.getPlayerProfile(uuid, (err, profile, isCached) => {
      if (err) {
        logger.error(err);
      }
      if (profile === null) {
        logger.debug(`[populatePlayers] ${uuid} not found in DB, generating...`);
        buildPlayer(uuid, (err, newPlayer) => {
          delete player.uuid;
          const profile = queries.getPlayerFields(newPlayer);
          profile.uuid = uuid;
          player.profile = profile;
          queries.cachePlayerProfile(profile, () => {
            done(err, player);
          });
        });
      } else {
        delete player.uuid;
        player.profile = profile;
        if (isCached) {
          done(err, player);
        } else {
          queries.cachePlayerProfile(profile, () => {
            done(err, player);
          });
        }
      }
    });
  }, (err, result) => {
    cb(result);
  });
}

module.exports = { buildPlayer, getPlayer, populatePlayers };
