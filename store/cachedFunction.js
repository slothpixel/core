const { read, write } = require('./cacheFunctions');

module.exports = async (key, cacheDuration, createCache) => {
  const cached = await read({ key });
  if (cached) {
    return cached;
  }

  const result = await createCache();

  await write({
    key,
    duration: cacheDuration,
  });

  return result;
};
