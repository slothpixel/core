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
  redis.zadd([item.attributes.id, end, JSON.stringify(data)], (err) => {
    if (err) {
      logger.error(err);
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

function processAndStoreAuctions(auctions = []) {
  function removeAuctionIds(bids) {
    bids.forEach((bid) => delete bid.auction_id);
    return bids;
  }
  function upsertDoc(uuid, update) {
    return {
      updateOne: {
        update: { $set: update },
        filter: { uuid },
        upsert: true,
      },
    };
  }
  async.map(auctions, (auction, cb) => {
    const { uuid } = auction;
    const update = getUpdateType(auction);
    if (update === 'none') {
      return cb();
    }
    // Insert new auction
    if (update === 'full') {
      decodeData(auction.item_bytes, (err, json) => {
        [auction.item] = processInventoryData(json);
        delete auction.item_bytes;
        auction.bids = removeAuctionIds(auction.bids);
        activeAuctions[uuid] = auction;
        return cb(err, upsertDoc(uuid, auction));
      });
    }
    // Only bids have changed
    if (update === 'partial') {
      activeAuctions[uuid].bids = removeAuctionIds(auction.bids);
      activeAuctions[uuid].highest_bid_amount = auction.highest_bid_amount;
      activeAuctions[uuid].end = auction.end;
      return cb(null, upsertDoc(uuid, {
        bids: activeAuctions[uuid].bids,
        end: auction.end,
        highest_bid_amount: auction.highest_bid_amount,
      }));
    }
  }, (err, bulkAuctionOps) => {
    if (err) {
      return logger.error(`auction processing failed: ${err}`);
    }
    // Remove empty elements from array
    bulkAuctionOps = bulkAuctionOps.filter(Boolean);
    if (bulkAuctionOps.length === 0) return;
    return bulkWrite('auction', bulkAuctionOps, { ordered: false }, (err) => {
      logger.error(`Failed bulkWrite: ${err.stack}`);
    });
  });
}

function getAuctionPage(page, cb) {
  const { url } = generateJob('skyblock_auctions', {
    page,
  });
  getData(redis, url, (err, body) => {
    if (err) {
      return cb(err.message, null);
    }
    return cb(null, body);
  });
}

function updateListings(cb) {
  getAuctionPage(0, (err, data) => {
    if (err) {
      return cb('Failed to update listings!');
    }
    logger.info(`[updateListings] Retrieving ${data.totalAuctions} auctions from ${data.totalPages} pages.`);
    const timestamp = new Date(data.lastUpdated);
    logger.info(`Data last updated at ${timestamp.toLocaleString()}`);
    processAndStoreAuctions(data.auctions);
    async.each([...Array(data.totalPages).keys()].slice(1), (page, cb) => {
      getAuctionPage(page, (err, data) => {
        if (err) {
          cb(`Failed getting auction page ${page}: ${err}`);
        }
        processAndStoreAuctions(data.auctions);
        cb();
      });
    });
    cb();
  });
}

invokeInterval(updateListings, 2 * 60 * 1000);
