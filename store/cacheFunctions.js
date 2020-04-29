const { fromPromise } = require('universalify');
const pify = require('pify');
const redis = require('./redis');
const { logger } = require('../util/utility');

const redisGetAsync = pify(redis.get).bind(redis);
const redisSetexAsync = pify(redis.setex).bind(redis);

exports.read = fromPromise(async (request) => {
  logger.debug(`[READCACHE] cache:${request.key}`);
  try {
    const data = await redisGetAsync(`cache:${request.key}`);
    let result;
    try {
      result = JSON.parse(data);
    } catch (error) {
      logger.error(`[READCACHE] Failed parsing cache JSON: ${error}`);
    }
    return result;
  } catch (error) {
    logger.error(`[READCACHE] Error: ${error}`);
  }
  return undefined;
});

exports.write = fromPromise(async (request, data) => {
  logger.debug(`[WRITECACHE] cache:${request.key}`);
  if (data === undefined) {
    return logger.warn('[WRITECACHE] Cache data is undefined! This should never happen');
  }
  let stringData;
  try {
    stringData = JSON.stringify(data);
  } catch (error) {
    return logger.error(`[WRITECACHE] Failed to stringify JSON: ${error}`);
  }
  await redisSetexAsync(`cache:${request.key}`, request.duration, stringData);
  return undefined;
});
