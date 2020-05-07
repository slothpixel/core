const { read, write } = require('./cacheFunctions');
const { logger } = require('../util/utility');

module.exports = async (key, createCache, { cacheDuration = 60, shouldCache = true } = {}) => {
  const cached = await read({ key });
  if (cached) {
    logger.debug(`Cache hit for ${key}`);
    return cached;
  }

  const result = await createCache();

  if (shouldCache) {
    logger.debug(`Caching ${key}`);
    await write({
      key,
      duration: cacheDuration,
    }, result);
  }

  return result;
};
