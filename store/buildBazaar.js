/* eslint-disable consistent-return */
const redis = require('./redis');
const cachedFunction = require('./cachedFunction');
const { getData, generateJob } = require('../util/utility');

module.exports = cachedFunction('bazaar', async () => {
  const { products } = await getData(redis, generateJob('bazaar_products').url);
  return products;
});
