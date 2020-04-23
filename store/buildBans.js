/* eslint-disable consistent-return */
const config = require('../config');
const { generateJob, getData } = require('../util/utility');
const cachedFunction = require('./cachedFunction');
const redis = require('./redis');

module.exports = () => cachedFunction('bans', async () => {
  const { url } = generateJob('watchdogstats');
  const data = await getData(redis, url);
  return {
    watchdog: {
      last_minute: data.watchdog_lastMinute,
      daily: data.watchdog_rollingDaily,
      total: data.watchdog_total,
    },
    staff: {
      daily: data.staff_rollingDaily,
      total: data.staff_total,
    },
  };
}, { cacheDuration: config.BANS_CACHE_SECONDS, shouldCache: config.ENABLE_BANS_CACHE });
