/* eslint-disable consistent-return */
const async = require('async');
const pify = require('pify');
const config = require('../config');
const processPlayerData = require('../processors/processPlayerData');
const getUUID = require('./getUUID');
const {
  logger, generateJob, getData, getPlayerFields,
} = require('../util/utility');
const redis = require('./redis');
const cachedFunction = require('./cachedFunction');
const { getPlayerProfile, cachePlayerProfile } = require('./queries');

/*
Functions to build/cache player object
 */
async function buildPlayer(uuid, { shouldCache = true } = {}) {
  return cachedFunction(`player:${uuid}`, async () => {
    const body = await getData(redis, generateJob('player', { id: uuid }).url);
    const playerData = processPlayerData(body.player || {});

    if (shouldCache && config.ENABLE_DB_CACHE) {
      // queries.insertPlayer(uuid, playerData);
    }

    return playerData;
  }, {
    cacheDuration: config.PLAYER_CACHE_SECONDS,
    shouldCache: shouldCache && config.ENABLE_PLAYER_CACHE,
  });
}

class PlayerError extends Error {
  constructor({ status, message }) {
    super(message);
    this.message = message;
    this.status = status;
  }
}

async function getPlayer(name) {
  try {
    const uuid = await getUUID(name);
    try {
      return await buildPlayer(uuid);
    } catch (error) {
      throw new PlayerError({ status: 500, message: error.message });
    }
  } catch (error) {
    throw new PlayerError({ status: 404, message: error.message });
  }
}

async function populatePlayers(players) {
  return async.map(players, async (player) => {
    const { uuid } = player;
    try {
      const [profile, isCached] = await pify(getPlayerProfile, {
        multiArgs: true,
      })(uuid);
      if (profile === null) {
        logger.debug(`[populatePlayers] ${uuid} not found in DB, generating...`);
        const newPlayer = await buildPlayer(uuid);
        delete player.uuid;
        const profile = getPlayerFields(newPlayer);
        profile.uuid = uuid;
        player.profile = profile;
        await cachePlayerProfile(profile);
        return player;
      }
      delete player.uuid;
      player.profile = profile;
      if (isCached) {
        return player;
      }
      await cachePlayerProfile(profile);
      return player;
    } catch (error) {
      logger.error(error);
    }
  });
}

module.exports = {
  buildPlayer, getPlayer, populatePlayers, PlayerError,
};
