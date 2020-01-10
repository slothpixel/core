/*
* Worker to replicate SkyBlock auction data from the Hypixel API
 */
const async = require('async');
const redis = require('../store/redis');
const {
  logger, generateJob, getData, decodeData, invokeInterval,
} = require('../util/utility');
const processInventoryData = require('../processors/processInventoryData');
const { insertAuction } = require('../store/queries');

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
* Determine whether there are new bids and should the auction be updated to DB
 */
function shouldUpdate(auction) {
  const { uuid } = auction;
  if (!(uuid in activeAuctions) || (auction.bids.length > activeAuctions[uuid].bids.length)) return true;
  // Check if auction has ended and remove from cache
  if (auction.end < Date.now()) {
    updatePrices(activeAuctions[uuid]);
    delete activeAuctions[uuid];
  }
  return false;
}

function processAndStoreAuctions(auctions = []) {
  auctions.forEach((auction) => {
    if (shouldUpdate(auction)) {
      const { uuid } = auction;
      // logger.debug(`Found new bids on auction ${uuid}!`);
      decodeData(auction.item_bytes, (err, json) => {
        [auction.item] = processInventoryData(json);
        // eslint-disable-next-line array-callback-return
        auction.bids.map((bid) => {
          delete bid.auction_id;
        });
        activeAuctions[uuid] = auction;
        return insertAuction(auction, () => {});
      });
    }
  });
}

function getAuctionPage(page, cb) {
  const { url } = generateJob('skyblock_auctions', {
    page,
  });
  getData(redis, url, (err, body) => {
    if (err) {
      return cb(err, null);
    }
    return cb(null, body);
  });
}

function updateListings(cb) {
  // eslint-disable-next-line consistent-return
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

invokeInterval(updateListings, 3 * 60 * 1000);
