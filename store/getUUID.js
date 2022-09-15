/* eslint-disable consistent-return */
/*
Functions to convert username to uuid and cache them.
Returns non-dashed uuid or an error.
*/
const config = require('../config');
const { removeDashes, getData } = require('../util/utility');
const cachedFunction = require('./cachedFunction');
const redis = require('./redis');

async function getUUID(name) {
  if ((/^[\da-f]{32}$/i).test(removeDashes(name))) {
    return removeDashes(name);
  }

  if (!(/^\w{1,16}$/i).test(name)) {
    throw new Error('Invalid username or UUID!');
  }

  return cachedFunction(`uuid:${name.toLowerCase()}`, async () => {
    const url = `https://api.ashcon.app/mojang/v2/user/${name}`;

    const response = await getData(redis, url);
    if (!response) {
      throw new Error('Invalid username!');
    }

    return removeDashes(response.uuid);
  }, { cacheDuration: config.UUID_CACHE_SECONDS, shouldCache: config.ENABLE_UUID_CACHE });
}

module.exports = getUUID;
