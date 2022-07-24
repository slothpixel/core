const config = require('../config');
const { getData, generateJob } = require('../util/utility');
const redis = require('./redis');
const getUUID = require('./getUUID');
const cachedFunction = require('./cachedFunction');
const processPlayerStatus = require('../processors/processPlayerStatus');

module.exports = async (username) => cachedFunction(`status:${username}`, async () => {
  const data = await getData(redis, generateJob('status', { id: await getUUID(username) }));
  return processPlayerStatus(data.session);
}, { cacheDuration: config.STATUS_CACHE_SECONDS });
