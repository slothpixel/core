/* eslint-disable consistent-return */
const config = require('../config');
const processGameCounts = require('../processors/processGameCounts');
const { generateJob, getData } = require('../util/utility');
const cachedFunction = require('./cachedFunction');
const redis = require('./redis');

module.exports = async () => cachedFunction(
  'counts',
  async () => processGameCounts(await getData(redis, generateJob('counts').url)),
  { cacheDuration: config.COUNTS_CACHE_SECONDS, shouldCache: config.ENABLE_COUNTS_CACHE },
);
