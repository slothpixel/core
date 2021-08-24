/* eslint-disable consistent-return */
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

    if (body.player === null) {
      throw new Error('Player has no Hypixel stats!');
    }

    const playerData = processPlayerData(body.player || {});

    if (shouldCache && config.ENABLE_DB_CACHE) {
      cachePlayerProfile(getPlayerFields(playerData));
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

/*
* Replaces player uuid fields with basic data
 */
async function populatePlayers(players = []) {
  return Promise.all(players.map(async (player) => {
    let profile = null;
    const { uuid } = player;
    delete player.uuid;
    profile = await getPlayerProfile(uuid);
    if (profile === null) {
      logger.debug(`[populatePlayers] ${uuid} not found in DB, generating...`);
      profile = getPlayerFields(await buildPlayer(uuid, { shouldCache: false }));
      await cachePlayerProfile(profile);
    }
    player.profile = profile;
    return player;
  }));
}

module.exports = {
  buildPlayer, getPlayer, populatePlayers, PlayerError,
};
