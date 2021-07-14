/* eslint-disable consistent-return */
/*
* Worker to replicate SkyBlock auction data from the Hypixel API
 */
const { Item, decodeData } = require('skyblock-parser');
const redis = require('../store/redis');
const {
  logger, generateJob, getData, syncInterval, chunkArray,
} = require('../util/utility');
const config = require('../config');

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

async function parseItemBytes(bytes) {
  const json = await decodeData(Buffer.from(bytes, 'base64'));
  return getInventory(json);
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
* Update or insert auctions
* @param {Array} auctions - Array of auction objects to be updated
 */
function updateAuctions(auctions) {
  const pipeline = redis.pipeline();
  auctions.forEach((auction) => pipeline.hset(`auction:${auction.uuid}`, ...Object.entries(auction).map(([key, value]) => [key, JSON.stringify(value)])));
  const uuidList = auctions.map((a) => a.uuid);
  const binList = auctions.filter((a) => a.bin).map((a) => a.uuid);
  pipeline.sadd('auction_ids', uuidList);
  pipeline.sadd('auction_bins', binList);
  pipeline.exec();
}

/*
* Remove auctions
* @param {Array} auctions - Array of auction objects to be removed
 */
function removeAuctions(auctions) {
  const idList = auctions.map((a) => a.uuid);
  redis.del(...auctions.map((a) => `auction:${a}`));
  redis.srem('auction_ids', idList);
  // Most of these are bins anyway so no need to filter
  redis.srem('auction_bins', idList);
}

async function updatePrices(auction) {
  const {
    // eslint-disable-next-line camelcase
    start, end, starting_bid, item_bytes, bids, highest_bid_amount, bin = false,
  } = auction;
  const [item] = await parseItemBytes(item_bytes);
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
async function getUpdateType(auction) {
  const { uuid } = auction;
  const bids = await redis.hget(`auction:${uuid}`, 'bids');
  if (!bids) return 'full';
  if (auction.bids.length > JSON.parse(bids).length) return 'partial';
  return 'none';
}

function removeAuctionIds(bids) {
  bids.forEach((bid) => delete bid.auction_id);
  return bids;
}

async function processAndStoreAuctions(auctions = []) {
  const updates = [];
  try {
    await Promise.all(auctions.map(async (auction) => {
      const update = await getUpdateType(auction);
      if (update === 'none') {
        return;
      }
      // Insert new auction
      if (update === 'full') {
        auction.bids = removeAuctionIds(auction.bids);
        updates.push(auction);
        return;
      }
      // Only bids have changed
      if (update === 'partial') {
        updates.push({
          bids: removeAuctionIds(auction.bids),
          highest_bid_amount: auction.highest_bid_amount,
          end: auction.end,
          uuid: auction.uuid,
        });
      }
    }));
  } catch (error) {
    return logger.error(`auction processing failed: ${error}`);
  }
  updateAuctions(updates);
}

async function processEndedAuctions() {
  const { auctions } = await getData(redis, generateJob('skyblock_auctions_ended').url);
  await removeAuctions(auctions);
  auctions.forEach((auction) => {
    auction.end = auction.timestamp;
    delete auction.timestamp;
  });
  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
  await Promise.all(auctions.map(updatePrices));
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
    const {
      auctions, totalPages,
    } = await getAuctionPage(0);
    const allAuctions = [...auctions];
    const pages = [...new Array(totalPages).keys()].slice(1);
    // In some environments, large numbers of concurrent requests are unable to be processed, so should be sent in chunks
    const chunks = chunkArray(pages, Number.parseInt(config.CONCURRENT_REQUEST_LIMIT)); // eslint-disable-line radix
    let auctionsLastUpdated;
    for (const chunk of chunks) {
      // eslint-disable-next-line no-await-in-loop,no-loop-func
      await Promise.all(chunk.map(async (page) => new Promise((resolve) => getAuctionPage(page).then(({ auctions, lastUpdated }) => {
        auctionsLastUpdated = lastUpdated;
        allAuctions.push(...auctions);
      }).then(resolve))));
    }
    await processAndStoreAuctions(allAuctions);
    logger.info(`[updateListings] Retrieved ${allAuctions.length} auctions from ${totalPages} pages.`);
    logger.info(`Data last updated at ${new Date(auctionsLastUpdated).toLocaleString()}, ${(Date.now() - auctionsLastUpdated) / 1000} seconds ago`);
    // Reset cache map so it doesn't take memory
    auctionCache.clear();
    return auctionsLastUpdated;
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
