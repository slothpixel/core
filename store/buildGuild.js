/* eslint-disable consistent-return */
const config = require('../config');
const processGuildData = require('../processors/processGuildData');
const getUUID = require('./getUUID');
const { logger, generateJob, getData } = require('../util/utility');
const redis = require('./redis');
const cacheFunctions = require('./cacheFunctions');
const { insertGuild, getGuildByPlayer, removeGuild } = require('./queries');

/*
* Functions to build/cache guild object
* Currently doesn't support search by name
 */
function getGuildData(id, cb) {
  const { url } = generateJob('guild', {
    id,
  });
  getData(redis, url, (err, body) => {
    if (err) {
      return cb(err);
    }
    if (body.guild === null) {
      cb(null, null);
      return removeGuild(id);
    }
    const guild = processGuildData(body.guild);
    return cb(null, guild);
  });
}

function getGuildID(uuid, cb) {
  // First check if we have the player in a cached guild
  getGuildByPlayer(uuid, (err, guild) => {
    if (!err && guild !== null) {
      logger.debug(`Found cached guild for ${uuid}: ${guild.name}`);
      return cb(null, guild.id);
    }
    logger.debug(`Ǹo cached guild found for ${uuid}`);
    const { url } = generateJob('findguild', {
      id: uuid,
    });
    getData(redis, url, (err, foundguild) => {
      if (err) {
        return cb(err);
      }
      if (foundguild.guild === null) {
        return cb('Player is not in a guild');
      }
      return cb(null, foundguild.guild);
    });
  });
}

function cacheGuild(guild, id, key, cb) {
  if (config.ENABLE_GUILD_CACHE) {
    cacheFunctions.write({
      key,
      duration: config.GUILD_CACHE_SECONDS,
    }, guild);
  }
  if (config.ENABLE_DB_CACHE) {
    insertGuild(id, guild, (err) => {
      if (err) {
        logger.error(err);
      }
    });
  }
  return cb(guild);
}

function buildGuild(uuid, cb) {
  getGuildID(uuid, (err, id) => {
    if (err) {
      return cb(err);
    }
    if (id === null) {
      return cb(null, { guild: null });
    }
    const key = `guild:${id}`;
    cacheFunctions.read({ key }, (guild) => {
      if (guild) {
        return cb(null, guild);
      }
      getGuildData(id, (err, guild) => {
        if (err) {
          return cb(err);
        }
        if (guild === null) {
          return cb(null, { guild: null });
        }
        cacheGuild(guild, id, key, (guild) => cb(null, guild));
      });
    });
  });
}

function getGuildFromPlayer(playerName, populatePlayers, cb) {
  getUUID(playerName, (err, uuid) => {
    if (err) {
      return cb(err, null);
    }
    buildGuild(uuid, (err, guild) => {
      if (err) {
        return cb(err, null);
      }
      if (populatePlayers !== undefined) {
        populatePlayers(guild.members, (players) => {
          guild.members = players;
          return cb(null, guild);
        });
      } else {
        return cb(null, guild);
      }
    });
  });
}

module.exports = { getGuildFromPlayer, getGuildData };
