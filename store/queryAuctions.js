/* eslint-disable consistent-return */
/*
* Allows custom DB queries for auctions API endpoint
 */
const config = require('../config');
const cacheFunctions = require('./cacheFunctions');
const redis = require('./redis');
const { logger } = require('../util/utility');
const { Auction } = require('./models');
const {
  min, max, median, average, stdDev,
} = require('../util/utility');

function cacheAuctions(auctions, key, cb) {
  if (config.ENABLE_AUCTION_CACHE) {
    cacheFunctions.write({
      key,
      duration: config.AUCTION_CACHE_SECONDS,
    }, auctions);
  }
  return cb(auctions);
}

/*
* Allows some filtering with simple parameters instead of user
* having to create MongoDB queries, stringifying and decoding them...
 */
function easyFilterQuery({
  tier, category, auctionUUID, itemUUID, id,
}) {
  const filter = {};
  if (tier) filter.tier = { $eq: tier };
  if (category) filter.category = { $eq: category };
  if (auctionUUID) filter.uuid = { $eq: auctionUUID };
  if (itemUUID) filter['item.attributes.uuid'] = { $eq: auctionUUID };
  if (id) filter['item.attributes.id'] = { $eq: id };
  return filter;
}

function createQuery({
  sortBy = 'end', sortOrder = 'desc', limit = 100, filter = '{}', active = true, page = 0,
}, easyFilter) {
  let error;
  let filterObj = {};
  try {
    filterObj = Object.assign(easyFilter, JSON.parse(filter));
  } catch (e) {
    error = `Failed to parse filter JSON: ${e.message}`;
  }
  if (active) {
    filterObj.end = { $gt: Date.now() };
  }
  if (limit > 1000) {
    limit = 1000;
  }
  sortOrder = (sortOrder === 'asc')
    ? 1
    : -1;
  return {
    filter: filterObj,
    options: {
      limit: Number(limit),
      skip: page * limit,
      sort: {
        [sortBy]: sortOrder,
      },
      maxTimeMS: 30000,
    },
    error,
  };
}

// Remove _id and __v fields from each entry
function transformData(data) {
  return data.map((doc) => {
    const obj = doc._doc;
    delete obj._id;
    delete obj.__v;
    return obj;
  });
}

function executeQuery(query, cb) {
  const easyFilter = easyFilterQuery(query);
  const { filter, options, error } = createQuery(query, easyFilter);
  if (error) {
    return cb(error);
  }
  Auction.find(filter, null, options, (err, res) => {
    if (err) {
      logger.error(err);
      return cb('Query failed');
    }
    cb(null, transformData(res));
  });
}

function getAuctions(query, cb) {
  const key = `auctions:${JSON.stringify(query)}`;
  cacheFunctions.read({ key }, (auctions) => {
    if (auctions) {
      logger.debug(`Cache hit for ${key}`);
      return cb(null, auctions);
    }
    executeQuery(query, (err, data) => {
      if (err) {
        cb(err);
      }
      cacheAuctions(data, key, (auctions) => cb(null, auctions));
    });
  });
}

function queryAuctionId(from, to, itemId, cb) {
  const now = Date.now();
  from = from || (now - 24 * 60 * 60 * 1000);
  to = to || now;

  if (Number.isNaN(Number(from)) || Number.isNaN(Number(to))) {
    return cb({ error: "parameters 'from' and 'to' must be integers" });
  }
  redis.zrangebyscore(itemId, from, to, (err, auctions) => {
    if (err) {
      logger.error(err);
    }
    const obj = {
      average_price: 0,
      median_price: 0,
      standard_deviation: 0,
      min_price: 0,
      max_price: 0,
      sold: 0,
      auctions: {},
    };
    const priceArray = [];
    auctions.forEach((auction) => {
      auction = JSON.parse(auction);
      const { bids } = auction;
      if (bids.length > 0) priceArray.push(bids[bids.length - 1].amount / auction.item.count);
      obj.auctions[auction.end] = auction;
    });
    obj.average_price = average(priceArray);
    obj.median_price = median(priceArray);
    obj.standard_deviation = stdDev(priceArray);
    obj.min_price = min(priceArray);
    obj.max_price = max(priceArray);
    obj.sold = priceArray.length;
    return cb(null, obj);
  });
}

module.exports = { getAuctions, queryAuctionId };
