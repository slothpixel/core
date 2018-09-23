/* eslint-disable consistent-return, no-shadow */
const config = require('../config');
const utility = require('../util/utility');
const redis = require('../store/redis');

/*
* Functions to build/cache ban statistics
 */
function getBans(cb) {
  const { url } = utility.generateJob('watchdogstats');
  utility.getData(url, (err, body) => {
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
  redis.get('bans', (err, reply) => {
    if (err) {
      return cb(err);
    }
    if (reply) {
      const bans = JSON.parse(reply);
      return cb(null, bans);
    }
    getBans((err, bans) => {
      if (config.ENABLE_BANS_CACHE) {
        redis.setex('bans', config.BANS_CACHE_SECONDS, JSON.stringify(bans), (err) => {
          if (err) {
            console.error(err);
          }
          return cb(null, bans);
        });
      }
    });
  });
}

module.exports = buildBans;
