/* eslint-disable consistent-return */
/*
* Worker to replicate SkyBlock auction data from the Hypixel API
 */
const async = require('async');
const redis = require('../store/redis');
const {
  logger, generateJob, getData, decodeData, invokeInterval,
} = require('../util/utility');
const processInventoryData = require('../processors/processInventoryData');
const { bulkWrite } = require('../store/queries');

const activeAuctions = {};

function updatePrices(auction) {
  const {
    // eslint-disable-next-line camelcase
    start, end, starting_bid, item, bids, highest_bid_amount,
  } = auction;
  const data = {
    start,
    end,
    starting_bid,
    bids,
    highest_bid_amount,
    item,
  };
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

function upsertDocument(uuid, update) {
  return {
    updateOne: {
      update: { $set: update },
      filter: { uuid },
      upsert: true,
    },
  };
}

function processAndStoreAuctions(auctions = []) {
  async.map(auctions, (auction, callback) => {
    const { uuid } = auction;
    const update = getUpdateType(auction);
    if (update === 'none') {
      return callback();
    }
    // Insert new auction
    if (update === 'full') {
      decodeData(auction.item_bytes).then((json) => {
        [auction.item] = processInventoryData(json);
        delete auction.item_bytes;
        auction.bids = removeAuctionIds(auction.bids);
        activeAuctions[uuid] = auction;
        callback(null, upsertDocument(uuid, auction));
      }).catch((error) => {
        logger.error(error);
        callback(error);
      });
    }
    // Only bids have changed
    if (update === 'partial') {
      activeAuctions[uuid].bids = removeAuctionIds(auction.bids);
      activeAuctions[uuid].highest_bid_amount = auction.highest_bid_amount;
      activeAuctions[uuid].end = auction.end;
      return callback(null, upsertDocument(uuid, {
        bids: activeAuctions[uuid].bids,
        end: auction.end,
        highest_bid_amount: auction.highest_bid_amount,
      }));
    }
  }, (error, bulkAuctionOps) => {
    if (error) {
      return logger.error(`auction processing failed: ${error}`);
    }
    // Remove empty elements from array
    bulkAuctionOps = bulkAuctionOps.filter(Boolean);
    if (bulkAuctionOps.length === 0) return;
    return bulkWrite('auction', bulkAuctionOps, { ordered: false }, (error) => {
      logger.error(`Failed bulkWrite: ${error.stack}`);
    });
  });
}

function getAuctionPage(page, callback) {
  const { url } = generateJob('skyblock_auctions', {
    page,
  });
  getData(redis, url, (error, body) => {
    if (error) {
      return callback(error.message, null);
    }
    return callback(null, body);
  });
}

function updateListings(callback) {
  getAuctionPage(0, (error, data) => {
    if (error) {
      return callback('Failed to update listings!');
    }
    logger.info(`[updateListings] Retrieving ${data.totalAuctions} auctions from ${data.totalPages} pages.`);
    const timestamp = new Date(data.lastUpdated);
    logger.info(`Data last updated at ${timestamp.toLocaleString()}`);
    processAndStoreAuctions(data.auctions);
    async.each([...new Array(data.totalPages).keys()].slice(1), (page, callback_) => {
      getAuctionPage(page, (error_, data) => {
        if (error_) {
          callback_(`Failed getting auction page ${page}: ${error_}`);
        }
        processAndStoreAuctions(data.auctions);
        callback_();
      });
    });
    callback();
  });
}

invokeInterval(updateListings, 2 * 60 * 1000);
