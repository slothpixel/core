/* eslint-disable consistent-return */
/*
* Worker to replicate SkyBlock auction data from the Hypixel API
 */
const async = require('async');
const { Item, decodeData } = require('skyblock-parser');
const redis = require('../store/redis');
const {
  logger, generateJob, getData, invokeInterval,
} = require('../util/utility');

const activeAuctions = {};

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

async function getInventory({ i }) {
  return Promise.all(i.map(async (item) => {
    const i = await new Item(item, false);
    // We can remove some properties that are unnecessary
    i.deleteProperties(['active', 'stats', 'rarity']);
    return i;
  }));
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

function upsertDocument(uuid, update) {
  return {
    updateOne: {
      update: { $set: update },
      filter: { uuid },
      upsert: true,
    },
  };
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
        return upsertDocument(uuid, auction);
      }
      // Only bids have changed
      if (update === 'partial') {
        activeAuctions[uuid].bids = removeAuctionIds(auction.bids);
        activeAuctions[uuid].highest_bid_amount = auction.highest_bid_amount;
        activeAuctions[uuid].end = auction.end;
        upsertDocument(uuid, {
          bids: activeAuctions[uuid].bids,
          end: auction.end,
          highest_bid_amount: auction.highest_bid_amount,
        });
      }
    }));
    // Remove empty elements from array
  } catch (error) {
    return logger.error(`auction processing failed: ${error}`);
  }
}

async function getAuctionPage(page) {
  const { url } = generateJob('skyblock_auctions', {
    page,
  });
  return getData(redis, url);
}

async function updateListings(callback) {
  try {
    const firstPage = await getAuctionPage(0);
    logger.info(`[updateListings] Retrieving ${firstPage.totalAuctions} auctions from ${firstPage.totalPages} pages.`);
    const timestamp = new Date(firstPage.lastUpdated);
    logger.info(`Data last updated at ${timestamp.toLocaleString()}`);
    processAndStoreAuctions(firstPage.auctions);
    await async.each([...new Array(firstPage.totalPages).keys()].slice(1), async (page) => {
      const data = await getAuctionPage(page);
      await processAndStoreAuctions(data.auctions);
    });
    callback();
  } catch {
    return callback('Failed to update listings!');
  }
}

invokeInterval(updateListings, 2 * 60 * 1000);
