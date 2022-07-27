/*
* Worker to periodically fetch bazaar data
 */
const { skyblock_bazaar: constants } = require('hypixelconstants');
const redis = require('../store/redis');
const {
  logger, generateJob, getData, invokeInterval,
} = require('../util/utility');

async function updateBazaar() {
  try {
    const { products } = await getData(redis, generateJob('bazaar_products').url);
    Object.keys(constants).forEach((key) => {
      const item = { ...constants[key] };
      item.category = `&${item.category_color}${item.category}`;
      delete item.category_color;
      products[key] = Object.assign(products[key], item);
    });
    await redis.set('skyblock_bazaar', JSON.stringify(products));
  } catch (error) {
    logger.error(`Failed to update bazaar listings: ${error}`);
  }
}

invokeInterval(updateBazaar, 60 * 1000);
