/* eslint-disable consistent-return */
const config = require('../config');
const processBoosters = require('../processors/processBoosters');
const utility = require('../util/utility');
const redis = require('../store/redis');

/*
* Functions to build/cache booster objects
 */
function getBoosterData(cb) {
  const { url } = utility.generateJob('boosters');
  utility.getData(url, (err, body) => {
    if (err) {
      return cb(err, null);
    }
    const boosters = processBoosters(body);
    return cb(null, boosters);
  });
}

function buildBoosters(cb) {
  redis.get('boosters', (err, reply) => {
    if (err) {
      return cb(err);
    } if (reply) {
      const boosters = JSON.parse(reply);
      return cb(null, boosters);
    }
    getBoosterData((err, boosters) => {
      if (err) {
        return cb(err);
      }
      if (config.ENABLE_BOOSTERS_CACHE) {
        redis.setex('boosters', config.BOOSTERS_CACHE_SECONDS, JSON.stringify(boosters), (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
      return cb(null, boosters);
    });
  });
}

module.exports = buildBoosters;
