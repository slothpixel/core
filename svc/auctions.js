/* eslint-disable consistent-return */
/*
* Worker to replicate SkyBlock auction data from the Hypixel API
 */
const { Item, decodeData } = require('skyblock-parser');
const redis = require('../store/redis');
const {
  logger, generateJob, getData, syncInterval,
} = require('../util/utility');

const activeAuctions = {};
// Contains uuid - bids key pair
const auctionCache = new Map();

async function getInventory({ i }) {
  return Promise.all(i.map(async (item) => {
    const i = await new Item(item, false);
    // We can remove some properties that are unnecessary
    i.deleteProperties(['active', 'stats', 'rarity']);
    return i;
  }));
}

function redisBulk(command, keys, arguments_, prefix) {
  const pipeline = redis.pipeline();
  // pipeline[command](keys[0], ...arguments_);
  // console.log(pipeline._queue);
  keys.forEach((key) => {
    if (prefix) {
      key = `${prefix}:${key}`;
    }
    pipeline[command](key, ...arguments_);
  });
  return pipeline.exec();
}

/*
* Add new auctions
 */
async function insertAuctions(auctions) {
  // Decode item data from item_bytes via skyblock-parser
  await Promise.all(auctions.map(async (auction) => {
    const json = await decodeData(Buffer.from(auction.item_bytes, 'base64'));
    [auction.item] = await getInventory(json);
  }));
  // await redis.hset();
  // const uuidList = auctions.map((a) => a.item.attributes.id);
  const uuidList = auctions.map((a) => a.uuid);
  const binList = auctions.filter((a) => a.bin).map((a) => a.uuid);
  redis.sadd('auction_ids', uuidList);
  redis.sadd('auction_bins', binList);
}

/*
* Update existing auctions
* @param {Array} auctions - Array of auctions objects to be updated
 */
function upsertAuctions(auctions) {
  const auction = {
    uuid: '123',
    highest_bid: 123456,
    bids: [],
  };
  // bids, highest_bid
  redis.hset();
}

/*
* Remove auctions
* @param {Array} auctions - Array of auctions objects to be removed
 */
function removeAuctions(auctions) {
  const idList = auctions.map((a) => a.uuid);
  redis.srem('auction_ids', idList);
  // Most of these are bins anyway so no need to filter
  redis.srem('auction_bins', idList);
}

function updatePrices(auction) {
  const {
    // eslint-disable-next-line camelcase
    start, end, starting_bid, item, bids, highest_bid_amount, bin = false,
  } = auction;
  const data = {
    start,
    end,
    starting_bid,
    bids,
    highest_bid_amount,
    item,
  };
  if (bin) data.bin = bin;
  redis.zadd([item.attributes.id, end, JSON.stringify(data)], (error) => {
    if (error) {
      logger.error(error);
    }
  });
}

/*
* Determine how the auction should be updated to DB
 */
function getUpdateType(auction) {
  const { uuid } = auction;
  if (!(uuid in activeAuctions)) return 'full';
  if ((auction.bids.length > activeAuctions[uuid].bids.length)) return 'partial';
  // Check if auction has ended and remove from cache
  if (auction.end < Date.now()) {
    updatePrices(activeAuctions[uuid]);
    delete activeAuctions[uuid];
  }
  return 'none';
}

function removeAuctionIds(bids) {
  bids.forEach((bid) => delete bid.auction_id);
  return bids;
}

async function processAndStoreAuctions(auctions = []) {
  try {
    await Promise.all(auctions.map(async (auction) => {
      const { uuid } = auction;
      const update = getUpdateType(auction);
      if (update === 'none') {
        return;
      }
      // Insert new auction
      if (update === 'full') {
        const json = await decodeData(Buffer.from(auction.item_bytes, 'base64'));
        [auction.item] = await getInventory(json);
        delete auction.item_bytes;
        auction.bids = removeAuctionIds(auction.bids);
        activeAuctions[uuid] = auction;
        return; // upsertDocument(uuid, auction);
      }
      // Only bids have changed
      if (update === 'partial') {
        activeAuctions[uuid].bids = removeAuctionIds(auction.bids);
        activeAuctions[uuid].highest_bid_amount = auction.highest_bid_amount;
        activeAuctions[uuid].end = auction.end;
      }
    }));
    // Remove empty elements from array
  } catch (error) {
    return logger.error(`auction processing failed: ${error}`);
  }
}

async function processEndedAuctions() {
  const { auctions } = await getData(redis, generateJob('skyblock_auctions_ended').url);
  await removeAuctions(auctions);
}

async function getAuctionPage(page) {
  const { url } = generateJob('skyblock_auctions', {
    page,
  });
  return getData(redis, url);
}

async function updateListings() {
  try {
    await processEndedAuctions();
    const normalAuctionsStored = (await redis.sdiff('auction_ids', 'auction_bins'));
    // console.log(normalAuctionsStored);
    const normalAuctions = await redisBulk('hget', normalAuctionsStored, ['highest_bid'], 'auction');
    console.log(normalAuctions);
    const {
      auctions, totalAuctions, totalPages, lastUpdated,
    } = await getAuctionPage(0);
    insertAuctions(auctions);
    // processAndStoreAuctions(auctions);
    logger.info(`[updateListings] Retrieving ${totalAuctions} auctions from ${totalPages} pages.`);
    logger.info(`Data last updated at ${new Date(lastUpdated).toLocaleString()}, ${(Date.now() - lastUpdated) / 1000} seconds ago`);
    // Get rest of the pages
    /*
    const pages = [...new Array(firstPage.totalPages).keys()].slice(1);
    await Promise.all(pages.map(async (page) => {
      await processAndStoreAuctions(await getAuctionPage(page).auctions);
    }));
     */
    // Reset cache map so it doesn't take memory
    auctionCache.clear();
    return lastUpdated;
  } catch (error) {
    logger.error(`Failed to update listings: ${error}`);
  }
}

/*
* Test cache state without requesting all pages
 */
async function test() {
  const { lastUpdated } = await getData(redis, generateJob('skyblock_auctions_ended').url);
  logger.info(`Data last updated at ${new Date(lastUpdated).toLocaleString()}, ${(Date.now() - lastUpdated) / 1000} seconds ago`);
  return lastUpdated;
}

syncInterval(test, updateListings);

/*
(async () => {
  const delta = 50 * 1000 - (Date.now() - await updateListings());
  logger.info(`Waiting ${delta / 1000} seconds before starting interval to catch up with Hypixel API`);
  setTimeout(() => {
    setInterval(updateListings, 60 * 1000);
  }, delta);
})();
 */
