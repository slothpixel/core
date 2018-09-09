/* eslint-disable consistent-return, no-shadow */
const config = require('../config');
const processGuildData = require('../processors/processGuildData');
const utility = require('../util/utility');
const redis = require('../store/redis');
// const queries = require('../store/queries');
/*
* Functions to build/cache guild object
* Currently doesn't support search by name
 */
function getGuildData(id, cb) {
  const { url } = utility.generateJob('guild', {
    id,
  });
  utility.getData(url, (err, body) => {
    if (err) {
      return cb(err);
    }
    // TODO - Add medal HTML parser
    const guild = processGuildData(body.guild);
    return cb(guild);
  });
}

function getGuildID(uuid, cb) {
  const { url } = utility.generateJob('findguild', {
    id: uuid,
  });
  utility.getData(url, (err, foundguild) => {
    if (err) {
      return cb(err);
    }
    return cb(null, foundguild.guild);
  });
}

function buildGuild(uuid, cb) {
  getGuildID(uuid, (err, id) => {
    if (err) {
      return cb(err);
    }
    if (id === null) {
      return cb(null);
    }
    const key = `guild:${id}`;
    redis.get(key, (err, reply) => {
      if (err) {
        return cb(err);
      } if (reply) {
        const guild = JSON.parse(reply);
        return cb(guild);
      }
      getGuildData(id, (err, guild) => {
        if (err) {
          return cb(err);
        }
        if (config.ENABLE_GUILD_CACHE) {
          return redis.setex(key, config.GUILD_CACHE_SECONDS, JSON.stringify(guild), (err) => {
            if (err) {
              console.error(err);
            }
            return cb(null, guild);
          });
        }
      });
    });
  });
}

module.exports = buildGuild;
