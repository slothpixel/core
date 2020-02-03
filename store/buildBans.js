/* eslint-disable consistent-return */
const config = require('../config');
const { generateJob, getData } = require('../util/utility');
const redis = require('../store/redis');
const cacheFunctions = require('../store/cacheFunctions');

/*
* Functions to build/cache ban statistics
 */
function getBans(cb) {
  const { url } = generateJob('watchdogstats');
  getData(redis, url, (err, body) => {
    if (err) {
      return cb(err, null);
    }
    return cb(null, {
      watchdog: {
        last_minute: body.watchdog_lastMinute,
        daily: body.watchdog_rollingDaily,
        total: body.watchdog_total,
      },
      staff: {
        daily: body.staff_rollingDaily,
        total: body.staff_total,
      },
    });
  });
}

function buildBans(cb) {
  cacheFunctions.read({ key: 'bans' }, (bans) => {
    if (bans) {
      return cb(null, bans);
    }
    getBans((err, bans) => {
      if (config.ENABLE_BANS_CACHE) {
        cacheFunctions.write({
          key: 'bans',
          duration: config.BANS_CACHE_SECONDS,
        }, bans);
        return cb(null, bans);
      }
    });
  });
}

module.exports = buildBans;
