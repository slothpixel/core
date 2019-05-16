/**
 * Worker that monitors health metrics and saves results
 * */
// const request = require('request');
// const config = require('../config');
const redis = require('../store/redis');
const { logger } = require('../util/utility');

// const apiKey = config.HYPIXEL_API_KEY;

function invokeInterval(func) {
  // invokes the function immediately, waits for callback, waits the delay, and then calls it again
  (function invoker() {
    logger.info(`running ${func.name}`);
    console.time(func.name);
    func((err, result) => {
      if (err) {
        console.error(err);
      }
      const final = result || {
        metric: 1,
        threshold: 0,
      };
      final.timestamp = Math.floor(new Date() / 1000);
      redis.hset('health', func.name, JSON.stringify(final));
      redis.expire('health', 900);
      console.timeEnd(func.name);
      setTimeout(invoker, final && final.delay ? final.delay : 30 * 1000);
    });
  }());
}

function redisUsage(cb) {
  redis.info((err) => {
    if (err) {
      return cb(err);
    }
    // console.log(info);
    return cb(err, {
      metric: Number(redis.server_info.used_memory),
      threshold: 2.5 * (10 ** 9),
    });
  });
}
const health = {
  redisUsage,
};
Object.keys(health).forEach((key) => {
  invokeInterval(health[key]);
});
