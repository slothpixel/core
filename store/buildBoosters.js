/* eslint-disable consistent-return */
const config = require('../config');
const processBoosters = require('../processors/processBoosters');
const { generateJob, getData } = require('../util/utility');
const redis = require('./redis');
const cacheFunctions = require('./cacheFunctions');

/*
* Functions to build/cache booster objects
 */
function getBoosterData(cb) {
  const { url } = generateJob('boosters');
  getData(redis, url, (err, body) => {
    if (err) {
      return cb(err.message, null);
    }
    const boosters = processBoosters(body);
    return cb(null, boosters);
  });
}

function buildBoosters(cb) {
  cacheFunctions.read({ key: 'boosters' }, (boosters) => {
    if (boosters) {
      return cb(null, boosters);
    }
    getBoosterData((err, boosters) => {
      if (err) {
        return cb(err);
      }
      if (config.ENABLE_BOOSTERS_CACHE) {
        cacheFunctions.write({
          key: 'boosters',
          duration: config.BOOSTERS_CACHE_SECONDS,
        }, boosters);
      }
      return cb(null, boosters);
    });
  });
}

module.exports = buildBoosters;
