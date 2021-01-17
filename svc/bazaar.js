/*
* Worker to peridically fetch bazaar data
 */
const redis = require('../store/redis');
const {
  logger, generateJob, getData, invokeInterval,
} = require('../util/utility');

async function updateBazaar(callback) {
  try {
    const { products } = await getData(redis, generateJob('bazaar_products').url);
    await redis.set('skyblock_bazaar', JSON.stringify(products));
  } catch (error) {
    logger.error(`Failed to update bazaar listings: ${error}`);
  }
  callback();
}

invokeInterval(updateBazaar, 60 * 1000);
