/* eslint-disable consistent-return */
/*
Functions to convert username to uuid and cache them.
Returns non-dashed uuid or an error.
*/
const config = require('../config');
const redis = require('./redis');
const { PlayerError } = require('./buildPlayer');
const { removeDashes, getData } = require('../util/utility');
const cachedFunction = require('./cachedFunction');

async function getUUID(name) {
  if ((/^[\da-f]{32}$/i).test(removeDashes(name))) {
    return removeDashes(name);
  }

  if (!(/^\w{1,16}$/i).test(name)) {
    throw new PlayerError({ status: 400, message: 'Invalid username or UUID!' });
  }

  return cachedFunction(`uuid:${name.toLowerCase()}`, async () => {
    const url = `https://playerdb.co/api/player/minecraft/${name}`;

    const response = await getData(redis, url);

    const { data } = response;
    return data.player.raw_id;
  }, { cacheDuration: config.UUID_CACHE_SECONDS, shouldCache: config.ENABLE_UUID_CACHE });
}

module.exports = getUUID;
