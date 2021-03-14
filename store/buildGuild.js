/* eslint-disable consistent-return */
const config = require('../config');
const processGuildData = require('../processors/processGuildData');
const getUUID = require('./getUUID');
const { generateJob, getData } = require('../util/utility');
const redis = require('./redis');
const cachedFunction = require('./cachedFunction');
const { populatePlayers } = require('./buildPlayer');

/*
* Functions to build/cache guild object
* Currently doesn't support search by name
 */
async function getGuildData(id) {
  const body = await getData(redis, generateJob('guild', {
    id,
  }).url);
  if (body.guild === null) {
    // removeGuild(id);
    return null;
  }
  const guild = processGuildData(body.guild);
  return guild;
}

async function createGuildCache(uuid) {
  const guildData = await getData(redis, generateJob('findguild', {
    id: uuid,
  }).url);

  if (guildData.guild === null) {
    return null;
  }

  return guildData.guild;
}

async function createGuildCacheFromName(name) {
  const guildData = await getData(redis, generateJob('findguildByName', {
    id: name,
  }).url);

  if (guildData.guild === null) {
    return null;
  }

  return guildData.guild;
}

async function getGuildID(uuid) {
  return createGuildCache(uuid);
  /*
  try {
    const guild = await getGuildByPlayer(uuid);
    if (guild !== null) {
      logger.debug(`Found cached guild for ${uuid}: ${guild.name}`);
      return guild.id;
    }
    return createGuildCache(uuid);
  } catch {
    return createGuildCache(uuid);
  }
   */
}

async function getGuildIDFromName(name) {
  return createGuildCacheFromName(name);
}

async function buildGuild(uuid) {
  const id = await getGuildID(uuid);
  if (id == null) {
    return { guild: null };
  }
  return cachedFunction(`guild:${id}`, async () => {
    const guild = await getGuildData(id);
    if (!guild) {
      return { guild: null };
    }

    if (config.ENABLE_DB_CACHE) {
      // insertGuild(id, guild);
    }

    return guild;
  }, { cacheDuration: config.GUILD_CACHE_SECONDS, shouldCache: config.ENABLE_GUILD_CACHE });
}

async function buildGuildFromName(name) {
  const id = await getGuildIDFromName(name);
  if (id == null) {
    return { guild: null };
  }
  return cachedFunction(`guild:${id}`, async () => {
    const guild = await getGuildData(id);
    if (!guild) {
      return { guild: null };
    }

    return guild;
  }, { cacheDuration: config.GUILD_CACHE_SECONDS, shouldCache: config.ENABLE_GUILD_CACHE });
}

async function getGuildFromPlayer(playerName, { shouldPopulatePlayers = false } = {}) {
  const guild = await buildGuild(await getUUID(playerName));
  if (shouldPopulatePlayers) {
    const players = await populatePlayers(guild.members);
    guild.members = players;
  }
  return guild;
}

async function getGuildFromName(guildName, { shouldPopulatePlayers = false } = {}) {
  const guild = await buildGuildFromName(guildName);
  if (shouldPopulatePlayers) {
    const players = await populatePlayers(guild.members);
    guild.members = players;
  }
  return guild;
}

async function getGuildFromID(guildID, { shouldPopulatePlayers = false } = {}) {
  const guild = await getGuildData(guildID);
  if (shouldPopulatePlayers) {
    const players = await populatePlayers(guild.members);
    guild.members = players;
  }
  return guild;
}

module.exports = {
  getGuildFromPlayer, getGuildFromName, getGuildData, getGuildFromID,
};
