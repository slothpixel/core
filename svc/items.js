/*
* Worker to generate SkyBlock item schema
 */
const bukkitToId = require('../util/bukkitToId.json');
const redis = require('../store/redis');
const {
  logger, invokeInterval, generateJob, getData,
} = require('../util/utility');

// TODO - expose this in sb-parser
function getSkinHash(base64) {
  let texture = null;
  try {
    texture = JSON.parse(Buffer.from(base64, 'base64').toString()).textures.SKIN.url.split('/').pop();
  } catch (e) {
    // do nothing
  }
  return texture;
}

/*
* Retrieve items resource from Hypixel API and do some processing
 */
async function updateItemList() {
  const itemsObject = {};
  const { url } = generateJob('skyblock_items');
  const { items } = await getData(redis, url);
  items.forEach((item) => {
    const {
      id, name, tier, category, skin, durability, ...rest
    } = item;
    const obj = {
      id,
      name,
      item_id: bukkitToId[item?.material] || 0,
      ...rest,
    };
    if (tier) {
      obj.tier = tier.toLowerCase();
    }
    if (category) {
      obj.category = category.toLowerCase();
    }
    if (durability) {
      obj.damage = durability;
    }
    if (skin) {
      obj.texture = getSkinHash(skin);
    }
    itemsObject[id] = obj;
  });
  // Get bazaar status
  try {
    const data = await redis.get('skyblock_bazaar');
    const bazaarProducts = Object.keys(JSON.parse(data));
    bazaarProducts.forEach((id) => {
      if (Object.hasOwn(itemsObject, id)) {
        itemsObject[id].bazaar = true;
      }
    });
  } catch (error) {
    logger.error(`Failed getting bazaar data: ${error}`);
  }
  try {
    logger.info('Updating item list to redis...');
    await redis.set('skyblock_items', JSON.stringify(itemsObject));
  } catch (error) {
    logger.error(`Failed updating skyblock_items: ${error}`);
  }
}

invokeInterval(updateItemList, 15 * 60 * 1000);
