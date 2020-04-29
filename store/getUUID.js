/* eslint-disable consistent-return */
/*
* Functions to convert username to uuid and cache them.
* Returns non-dashed uuid or an error.
 */
const config = require('../config');
const { logger, removeDashes, getData } = require('../util/utility');
const cacheFunctions = require('./cacheFunctions');
const redis = require('./redis');

function fetchUUID(username, cb) {
  const url = `https://api.mojang.com/users/profiles/minecraft/${username}`;
  return getData(redis, url, (err, body) => {
    if (err) {
      return cb(err.message);
    }
    if (!body) {
      return cb('Invalid username!');
    }
    const uuid = JSON.parse(body).id;
    return cb(null, uuid);
  });
}

function getUUID(name, cb) {
  if ((/^[0-9a-f]{32}$/i).test(removeDashes(name))) {
    return cb(null, removeDashes(name));
  }
  if (!(/^\w{1,16}$/i).test(name)) {
    return cb('Invalid username or UUID!');
  }
  const key = `uuid:${name.toLowerCase()}`;
  cacheFunctions.read({ key }, (uuid) => {
    if (uuid) {
      logger.debug(`Cache hit for uuid: ${name} - ${uuid}`);
      return cb(null, uuid);
    }
    logger.debug(`Cache miss for uuid ${name}`);
    fetchUUID(name, (fetchErr, uuid) => {
      if (fetchErr) {
        return cb(fetchErr, null);
      }
      if (config.ENABLE_UUID_CACHE) {
        cacheFunctions.write({
          key,
          duration: config.UUID_CACHE_SECONDS,
        }, uuid);
        return cb(null, uuid);
      }
      return cb(null, uuid);
    });
  });
}

module.exports = getUUID;
