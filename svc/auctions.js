/* eslint-disable consistent-return */
/*
* Worker to replicate SkyBlock auction data from the Hypixel API
 */
const { Item, decodeData } = require('skyblock-parser');
const redis = require('../store/redis');
const {
  logger, generateJob, getData, redisBulk, syncInterval, chunkArray,
} = require('../util/utility');
const config = require('../config');

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

function removeAuctionsById(ids) {
  redisBulk(redis, 'del', ids, [], 'auction');
  redis.srem('auction_ids', ids);
  // Most of these are bins anyway so no need to filter
  redis.srem('auction_bins', ids);
}

/*
* Clears ended dangling auctions due to downtime
* @param {Set} active - Set of active auction ids
 */
async function clearEnded(active) {
  const old = await redis.smembers('auction_ids');
  const expired = [...new Set(old.filter((id) => !active.has(id)))];
  logger.info(`Removing ${expired.length} dangling auctions`);
  removeAuctionsById(expired);
}

/*
* Insert auctions
* @param {Array} auctions - Array of auction objects to be inserted
 */
async function insertAuctions(auctions) {
  const pipeline = redis.pipeline();
  auctions.forEach((auction) => pipeline.hset(`auction:${auction.uuid}`, ...Object.entries(auction)
    .map(([key, value]) => [key, JSON.stringify(value)])));
  const uuidList = auctions.map((a) => a.uuid);
  const binList = auctions.filter((a) => a.bin)
    .map((a) => a.uuid);
  await Promise.all(auctions.map(async (a) => {
    const data = await parseItemBytes(a.item_bytes);
    // pipeline.sadd(`auction_item_id:${a.id}`, a.uuid);
  }));
  pipeline.sadd('auction_ids', uuidList);
  pipeline.sadd('auction_bins', binList);
  pipeline.exec();
}

/*
* Update auctions
* @param {Array} auctions - Array of auction objects to be updated
 */
function updateAuctions(auctions) {
  const pipeline = redis.pipeline();
  auctions.forEach((auction) => pipeline.hset(`auction:${auction.uuid}`, ...Object.entries(auction)
    .map(([key, value]) => [key, JSON.stringify(value)])));
  pipeline.exec();
}

/*
* Remove auctions
* @param {Array} auctions - Array of auction objects to be removed
 */
function removeAuctions(auctions) {
  const ids = auctions.map((a) => a.auction_id);
  removeAuctionsById(ids);
}

// TODO
// Need to also add filtering for merely expired auctions
/*
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
 */

/*
* Determine how the auctions should be updated to DB
 */
async function getUpdateTypes(auctions) {
  const ids = auctions.map((a) => a.uuid);
  const bids = await redisBulk(redis, 'hget', ids, ['bids'], 'auction');
  return bids.map(([, bids], index) => {
    const auction = auctions[index];
    let type = 'none';
    if (bids === null) {
      return 'full';
    }
    bids = JSON.parse(bids);
    if (bids.length < auction.bids.length) {
      type = 'partial';
    }
    return type;
  });
}

function removeAuctionIds(bids) {
  bids.forEach((bid) => delete bid.auction_id);
  return bids;
}

async function processAndStoreAuctions(auctions = []) {
  const updateTypes = await getUpdateTypes(auctions);
  logger.info(`Full update: ${updateTypes.filter((n) => n === 'full').length}`);
  logger.info(`Partial update: ${updateTypes.filter((n) => n === 'partial').length}`);
  logger.info(`No update: ${updateTypes.filter((n) => n === 'none').length}`);

  const insertions = [];
  const updates = [];

  updateTypes.forEach((type, index) => {
    const auction = auctions[index];
    if (type === 'full') {
      auction.bids = removeAuctionIds(auction.bids);
      insertions.push(auction);
    }
    if (type === 'partial') {
      updates.push({
        bids: removeAuctionIds(auction.bids),
        highest_bid_amount: auction.highest_bid_amount,
        end: auction.end,
        uuid: auction.uuid,
      });
    }
  });
  insertAuctions(insertions);
  updateAuctions(updates);
}

async function processEndedAuctions() {
  const { auctions } = await getData(redis, generateJob('skyblock_auctions_ended').url);
  logger.info(`Removing ${auctions.length} ended auctions`);
  await removeAuctions(auctions);
  auctions.forEach((auction) => {
    auction.end = auction.timestamp;
    delete auction.timestamp;
  });
  // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
  // await Promise.all(auctions.map(updatePrices));
}

async function getAuctionPage(page) {
  const { url } = generateJob('skyblock_auctions', {
    page,
  });
  return getData(redis, url);
}

let firstStartup = true;

async function updateListings() {
  try {
    await processEndedAuctions();
    const {
      auctions,
      totalPages,
    } = await getAuctionPage(0);
    const allAuctions = [...auctions];
    const pages = [...new Array(totalPages).keys()].slice(1);
    // In some environments, large numbers of concurrent requests are unable to be processed, so should be sent in chunks
    const chunks = chunkArray(pages, Number.parseInt(config.CONCURRENT_REQUEST_LIMIT)); // eslint-disable-line radix
    let auctionsLastUpdated;
    for (const chunk of chunks) {
      // eslint-disable-next-line no-await-in-loop,no-loop-func
      await Promise.all(chunk.map(async (page) => new Promise((resolve) => getAuctionPage(page)
        .then(({
          auctions,
          lastUpdated,
        }) => {
          auctionsLastUpdated = lastUpdated;
          allAuctions.push(...auctions);
        })
        .then(resolve))));
    }
    if (firstStartup) {
      const activeIds = new Set(allAuctions.map((a) => a.uuid));
      // console.log(active_ids);
      clearEnded(activeIds);
      firstStartup = false;
    }
    await processAndStoreAuctions(allAuctions);
    const totalAuctions = allAuctions.length;
    redis.set('auction_meta', JSON.stringify({ lastUpdated: auctionsLastUpdated, totalAuctions }));
    logger.info(`[updateListings] Retrieved ${totalAuctions} auctions from ${totalPages} pages.`);
    logger.info(`Data last updated at ${new Date(auctionsLastUpdated).toLocaleString()}, ${(Date.now() - auctionsLastUpdated) / 1000} seconds ago`);
    return auctionsLastUpdated;
  } catch (error) {
    logger.error(`Failed to update listings: ${error}`);
  }
}

/*
* Test cache state without requesting all pages
 */
async function probeCache() {
  const { lastUpdated } = await getData(redis, generateJob('skyblock_auctions_ended').url);
  logger.info(`Data last updated at ${new Date(lastUpdated).toLocaleString()}, ${(Date.now() - lastUpdated) / 1000} seconds ago`);
  return lastUpdated;
}

syncInterval(probeCache, updateListings);
