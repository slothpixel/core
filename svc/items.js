/* eslint-disable consistent-return */
/*
* Worker to generate SkyBlock item schema from auction database
 */
const async = require('async');
const pify = require('pify');
const redis = require('../store/redis');
const { getItems, getAuctions } = require('../store/queries');
const {
  logger, removeFormatting, generateJob, getData, invokeInterval,
} = require('../util/utility');

const redisSetAsync = pify(redis.set).bind(redis);

async function updateBazaar() {
  try {
    const { products } = await getData(redis, generateJob('bazaar_products'));
    const items = Object.keys(products);
    try {
      await redisSetAsync('skyblock_bazaar', JSON.stringify(items));
      logger.info('[Bazaar] Updated item IDs');
      return items;
    } catch (error) {
      logger.error(error.message);
    }
  } catch {
    return [];
  }
}

const schemaObject = (auction) => {
  const {
    tier,
    category,
    item,
  } = auction;
  try {
    return {
      name: removeFormatting(item.name),
      tier,
      category,
      item_id: item.item_id,
      damage: item.damage || null,
      texture: item.attributes.texture,
    };
  } catch {
    logger.warn(`Found bad item in DB: ${JSON.stringify(auction)}`);
  }
};

async function doItems(callback) {
  const bazaarProducts = await updateBazaar();
  getItems((error, ids) => {
    if (error) {
      logger.error(error);
      callback(error);
    }
    logger.info(`Found ${ids.length} item IDs from the database`);
    redis.get('skyblock_items', (error, response) => {
      if (error) {
        logger.error(error);
        callback(error);
      }
      const items = JSON.parse(response) || {};
      const newIds = ids.filter((id) => !(id in items));
      logger.info(`${newIds.length} IDs aren't currently included`);
      let counter = 0;
      async.each(ids, (id, callback_) => {
        if (!(id in items)) {
          getAuctions({
            'item.attributes.id': id,
            'item.attributes.modifier': null,
            'item.name': { $ne: '§fnull' },
          }, 'tier category item', { limit: 1, sort: { end: -1 } }, (error_, auction) => {
            if (error_) {
              return callback_(error_);
            }
            if (auction.length === 0) return callback_();
            counter += 1;
            items[id] = schemaObject(auction[0]);
            if (bazaarProducts.includes(id)) {
              items[id].bazaar = true;
            }
            const item = items[id];
            if (item) {
              if (item.texture === null) {
                delete items[id].texture;
              }
              if (item.damage === null || item.texture) {
                delete items[id].damage;
              }
            }
            return callback_();
          });
        } else {
          if (bazaarProducts.includes(id)) {
            items[id].bazaar = true;
          }
          return callback_();
        }
      }, (error) => {
        if (error) {
          return callback(error);
        }
        redis.set('skyblock_items', JSON.stringify(items), (error) => {
          if (error) logger.error(error);
          logger.info(`${counter} new items discovered`);
          return callback();
        });
      });
    });
  });
}

invokeInterval(doItems, 60 * 60 * 1000);
