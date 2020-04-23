/* eslint-disable consistent-return */
const config = require('../config');
const processBoosters = require('../processors/processBoosters');
const { generateJob, getData } = require('../util/utility');
const redis = require('./redis');
const cachedFunction = require('./cachedFunction');

module.exports = cachedFunction('boosters', config.BOOSTERS_CACHE_SECONDS, async () => {
  const boosters = processBoosters(await getData(redis, generateJob('boosters').url));
  return boosters;
});
