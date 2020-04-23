const { read, write } = require('./cacheFunctions');

module.exports = async (key, createCache, { cacheDuration = 60, shouldCache = true } = {}) => {
  const cached = await read({ key });
  if (cached) {
    return cached;
  }

  const result = await createCache();

  if (shouldCache) {
    await write({
      key,
      duration: cacheDuration,
    });
  }

  return result;
};
