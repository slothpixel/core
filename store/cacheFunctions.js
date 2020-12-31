const { fromPromise } = require('universalify');
const redis = require('./redis');
const { logger } = require('../util/utility');

exports.read = fromPromise(async (request) => {
  logger.debug(`[READCACHE] cache:${request.key}`);
  try {
    const data = await redis.get(`cache:${request.key}`);
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
  await redis.setex(`cache:${request.key}`, request.duration, stringData);
});
