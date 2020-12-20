/*
* Worker to generate SkyBlock item schema from inventories processed by web
 */
const pify = require('pify');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const config = require('../config');
const redis = require('../store/redis');
const {
  logger, generateJob, getData, invokeInterval,
} = require('../util/utility');

const redisSetAsync = pify(redis.set).bind(redis);
const redisGetAsync = pify(redis.get).bind(redis);

const app = express();
const port = config.PORT || config.ITEMS_PORT;
const discoveredItems = new Set();

let bazaarProducts = [];
let itemList = {};

(async function init() {
  try {
    itemList = JSON.parse(await redisGetAsync('skyblock_items')) || {};
    const items = Object.keys(itemList);
    logger.info(`Caching existing ${items.length} item IDs`);
    discoveredItems.add(...items);
  } catch (error) {
    logger.error(`Failed retrieving skyblock_items from redis: ${error}`);
  }
}());

async function updateItemList() {
  try {
    logger.info('Updating item list to redis...');
    await redisSetAsync('skyblock_items', JSON.stringify(itemList));
  } catch (error) {
    logger.error(`Failed updating skyblock_items: ${error}`);
  }
}

async function updateBazaar() {
  try {
    const { products } = await getData(redis, generateJob('bazaar_products'));
    bazaarProducts = Object.keys(products);
    try {
      await redisSetAsync('skyblock_bazaar', JSON.stringify(bazaarProducts));
      logger.info('[Bazaar] Updated item IDs');
      let changes = 0;
      discoveredItems.forEach((id) => {
        if (bazaarProducts.includes(id)) {
          itemList[id].bazaar = true;
          changes += 1;
        }
      });
      if (changes > 0) {
        logger.info(`Discovered ${changes} new bazaar items!`);
        updateItemList();
      }
    } catch (error) {
      logger.error(error.message);
    }
  } catch (error) {
    logger.error(`Failed updating bazaar products: ${error}`);
  }
}

invokeInterval(updateBazaar, 60 * 60 * 1000);

app.use(compression());
app.use(bodyParser.json());
app.post('/', (request, response, _callback) => {
  const items = request.body;
  let updates = false;
  items.forEach((item) => {
    const { id } = item;
    if (!discoveredItems.has(id)) {
      updates = true;
      logger.info(`Found new item ID ${id}`);
      if (item.texture === null) {
        delete item.texture;
      }
      if (item.damage === null || item.texture) {
        delete item.damage;
      }
      delete item.id;
      itemList[id] = item;
      discoveredItems.add(id);
    }
  });
  if (updates) {
    updateItemList();
  }
  response.json({ status: 'ok' });
});
app.delete('/:id', (request, response, _callback) => {
  const { id } = request.params;
  if (id in itemList) {
    logger.info(`Deleting entry for item ${id}`);
    delete itemList[id];
    updateItemList();
  }
  response.json({ status: 'ok' });
});
app.use((error, _, response) => response.status(500).json({
  error,
}));
const server = app.listen(port, () => {
  const host = server.address().address;
  logger.info(`[ITEMS] listening at http://${host}:${port}`);
});
