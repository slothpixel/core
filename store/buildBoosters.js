/* eslint-disable consistent-return */
const config = require('../config');
const processBoosters = require('../processors/processBoosters');
const { generateJob, getData } = require('../util/utility');
const redis = require('./redis');
const cachedFunction = require('./cachedFunction');

module.exports = async () => cachedFunction(
  'boosters',
  async () => processBoosters(await getData(redis, generateJob('boosters').url)),
  { cacheDuration: config.BOOSTERS_CACHE_SECONDS, shouldCache: config.ENABLE_BOOSTERS_CACHE },
);
