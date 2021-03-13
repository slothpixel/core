/*
* Worker to generate SkyBlock item schema from inventories processed by web
 */
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const config = require('../config');
const redis = require('../store/redis');
const {
  logger, invokeInterval,
} = require('../util/utility');

const app = express();
const port = config.PORT || config.ITEMS_PORT;

let discoveredItems;
let bazaarProducts = [];
let itemList = {};

(async function init() {
  try {
    itemList = JSON.parse(await redis.get('skyblock_items')) || {};
    const items = Object.keys(itemList);
    logger.info(`Caching existing ${items.length} item IDs`);
    discoveredItems = new Set(items);
  } catch (error) {
    logger.error(`Failed retrieving skyblock_items from redis: ${error}`);
  }
}());

async function updateItemList() {
  try {
    logger.info('Updating item list to redis...');
    await redis.set('skyblock_items', JSON.stringify(itemList));
  } catch (error) {
    logger.error(`Failed updating skyblock_items: ${error}`);
  }
}

async function updateBazaar() {
  try {
    const data = await redis.get('skyblock_bazaar');
    bazaarProducts = Object.keys(JSON.parse(data));
    try {
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
    discoveredItems.delete(id);
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
