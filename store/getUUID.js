/* eslint-disable consistent-return */
/*
* Functions to convert username to uuid and cache them.
* Returns non-dashed uuid or an error.
 */
const config = require('../config');
const util = require('../util/utility');
const redis = require('../store/redis');

function fetchUUID(username, cb) {
  const url = `https://api.mojang.com/users/profiles/minecraft/${username}`;
  return util.getData(url, (err, body) => {
    if (err) {
      return cb(err, null);
    }
    const uuid = JSON.parse(body).id;
    return cb(null, uuid);
  });
}

function getUUID(name, cb) {
  const key = `uuid:${name}`;
  redis.get(key, (err, reply) => {
    if (err) {
      return cb(err);
    } else if (reply) {
      // console.log(`Cache hit for match ${name}`);
      const uuid = JSON.parse(reply);
      return cb(err, uuid);
    }
    // console.log(`Cache miss for player ${name}`);
    if ((/^[0-9a-f]{32}$/i).test(name)) {
      return cb(null, name);
    }
    if ((/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).test(name)) {
      return cb(null, util.removeDashes(name));
    }
    fetchUUID(name, (fetchErr, uuid) => {
      if (fetchErr) {
        return cb(fetchErr, null);
      }
      if (config.ENABLE_UUID_CACHE) {
        return redis.setex(key, config.UUID_CACHE_SECONDS, JSON.stringify(uuid), (redisErr) => {
          if (err) {
            console.error(redisErr);
          }
          return cb(null, uuid);
        });
      }
      return cb(null, uuid);
    });
  });
}

module.exports = getUUID;
