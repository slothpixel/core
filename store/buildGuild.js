/* eslint-disable consistent-return */
const config = require('../config');
const processGuildData = require('../processors/processGuildData');
const {
  generateJob,
  getData,
} = require('../util/utility');
const redis = require('./redis');
const cachedFunction = require('./cachedFunction');
const { populatePlayers } = require('./buildPlayer');

/*
* Functions to build/cache guild object
 */
function getGuildData({ guild }) {
  if (guild === null) {
    return null;
  }
  return processGuildData(guild);
}

async function buildGuild(type, id, { shouldPopulatePlayers = false } = {}) {
  const key = `guild:${type}:${id}`;
  const guild = await cachedFunction(key, async () => {
    let body = {};
    switch (type) {
      case 'player':
        body = await getData(redis, generateJob('guildByPlayer', { id }).url);
        break;
      case 'name':
        body = await getData(redis, generateJob('guildByName', { id }).url);
        break;
      case 'id':
      default:
        body = await getData(redis, generateJob('guildById', { id }).url);
    }

    const guild = getGuildData(body);
    if (!guild) {
      return { guild: null };
    }
    return guild;
  }, {
    cacheDuration: config.GUILD_CACHE_SECONDS,
    shouldCache: config.ENABLE_GUILD_CACHE,
  });

  if (shouldPopulatePlayers) {
    guild.members = await populatePlayers(guild.members);
  }
  return guild;
}

module.exports = buildGuild;
