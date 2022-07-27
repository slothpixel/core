/* eslint-disable consistent-return */
/*
* Worker to replicate SkyBlock auction data from the Hypixel API
 */
const { Item, decodeData } = require('skyblock-parser');
const redis = require('../store/redis');
const {
  logger, generateJob, getData, redisBulk, invokeInterval, syncInterval, chunkArray,
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
  if (ids.length === 0) return;
  redisBulk(redis, 'del', ids, 'auction');
  redis.zrem('auction_ids', ids);
  // Most of these are bins anyway so no need to filter
  redis.srem('auction_bins', ids);
}

/*
* Clears ended dangling auctions due to downtime
* @param {Set} active - Set of active auction ids
 */
async function clearEnded(active) {
  const old = await redis.zrange('auction_ids', 0, -1);
  const expired = [...new Set(old.filter((id) => !active.has(id)))];
  logger.info(`Removing ${expired.length} dangling auctions`);
  removeAuctionsById(expired);
}

/*
* Clear filter sets
 */
async function clearSets() {
  const now = Date.now();
  const stream = redis.scanStream({
    match: 'auction_*:*',
    type: 'zset',
  });
  stream.on('data', (resultKeys) => {
    for (const resultKey of resultKeys) {
      redis.zremrangebyscore(resultKey, 0, now);
    }
  });
  // eslint-disable-next-line no-promise-executor-return
  await new Promise((resolve, reject) => stream
    .on('end', resolve)
    .on('error', reject));
}

function updateSets(pipeline, {
  uuid, end, category, tier,
}, id) {
  pipeline.zadd('auction_ids', end, uuid);
  pipeline.zadd(`auction_item_id:${id}`, end, uuid);
  pipeline.zadd(`auction_category:${category}`, end, uuid);
  pipeline.zadd(`auction_rarity:${tier}`, end, uuid);
}

/*
* Insert auctions
* @param {Array} auctions - Array of auction objects to be inserted
 */
async function insertAuctions(auctionsRaw) {
  const pipeline = redis.pipeline();

  const auctions = await Promise.all(auctionsRaw.map(async (a) => {
    const [data] = await parseItemBytes(a.item_bytes);
    a.item = data;
    delete a.item_bytes;
    delete a.item_lore;
    updateSets(pipeline, a, data.attributes.id);
    return a;
  }));

  auctions.forEach((auction) => {
    pipeline.hmset(`auction:${auction.uuid}`, { json: JSON.stringify(auction), bids: auction.bids.length });
  });

  const binList = auctions.filter((a) => a.bin)
    .map((a) => a.uuid);

  pipeline.sadd('auction_bins', binList);
  pipeline.exec();
}

/*
* Update auctions
* @param {Array} auctions - Array of auction objects to be updated
 */
function updateAuctions(auctions) {
  const pipeline = redis.pipeline();

  auctions.forEach(([auction, bids, endChanged]) => {
    pipeline.hmset(`auction:${auction.uuid}`, { json: JSON.stringify(auction), bids });
    if (endChanged) {
      updateSets(pipeline, auction, auction.item.attributes.id);
    }
  });

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
  const storedAuctions = await redisBulk(redis, 'hmget', ids, 'auction', ['bids', 'json']);

  return storedAuctions.map((data, index) => {
    const [bids, json] = data[1];
    const auction = auctions[index];

    let type = ['none'];

    if (bids === null) {
      return ['full'];
    }

    if (bids < auction.bids.length) {
      type = ['partial', JSON.parse(json)];
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

  const insertions = [];
  const updates = [];

  updateTypes.forEach(([type, data], index) => {
    const auction = auctions[index];

    if (type === 'full') {
      auction.bids = removeAuctionIds(auction.bids);
      insertions.push(auction);
    }

    if (type === 'partial') {
      data.bids = removeAuctionIds(auction.bids);
      data.highest_bid_amount = auction.highest_bid_amount;

      const endChanged = data.end < auction.end;
      data.end = auction.end;

      updates.push([
        data,
        auction.bids.length,
        endChanged,
      ]);
    }
  });

  const insertionCount = insertions.length;
  const updateCount = updates.length;

  logger.info(`Full update: ${insertionCount}`);
  logger.info(`Partial update: ${updateCount}`);
  logger.info(`No update: ${auctions.length - insertionCount - updateCount}`);

  insertAuctions(insertions);
  updateAuctions(updates);
}

async function processEndedAuctions() {
  const { auctions } = await getData(redis, generateJob('skyblock_auctions_ended').url);
  logger.info(`Removing ${auctions.length} ended auctions`);
  await removeAuctions(auctions);
  /*
  auctions.forEach((auction) => {
    auction.end = auction.timestamp;
    delete auction.timestamp;
  });
  await Promise.all(auctions.map(updatePrices));
   */
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
      auctions,
      totalPages,
    } = await getAuctionPage(0);

    const allAuctions = [...auctions];
    const pages = [...new Array(totalPages).keys()].slice(1);

    // In some environments, large numbers of concurrent requests are unable to be processed, so they should be sent in chunks
    const chunks = chunkArray(pages, Number.parseInt(config.CONCURRENT_REQUEST_LIMIT, 10));

    let auctionsLastUpdated;
    for (const chunk of chunks) {
      // eslint-disable-next-line no-await-in-loop,no-loop-func,no-promise-executor-return
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

    // Not all auctions are marked as ended by Hypixel, so we need manual cleanup
    const activeIds = new Set(allAuctions.map((a) => a.uuid));
    clearEnded(activeIds);

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
invokeInterval(clearSets, 1000 * 60 * 15);
