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
const parseTimestamp = require('../util/readableTimestamps');

function cacheAuctions(auctions, key, callback) {
  if (config.ENABLE_AUCTION_CACHE) {
    cacheFunctions.write({
      key,
      duration: config.AUCTION_CACHE_SECONDS,
    }, auctions);
  }
  return callback(auctions);
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
  let filterObject = {};
  try {
    filterObject = Object.assign(easyFilter, JSON.parse(filter));
  } catch (error_) {
    error = `Failed to parse filter JSON: ${error_.message}`;
  }
  if (active) {
    filterObject.end = { $gt: Date.now() };
  }
  if (limit > 1000) {
    limit = 1000;
  }
  sortOrder = (sortOrder === 'asc')
    ? 1
    : -1;
  return {
    filter: filterObject,
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
  return data.map((document) => {
    const object = document._doc;
    delete object._id;
    delete object.__v;
    return object;
  });
}

function executeQuery(query, callback) {
  const easyFilter = easyFilterQuery(query);
  const { filter, options, error } = createQuery(query, easyFilter);
  if (error) {
    return callback(error);
  }
  Auction.find(filter, null, options, (error_, result) => {
    if (error_) {
      logger.error(error_);
      return callback('Query failed');
    }
    callback(null, transformData(result));
  });
}

function getAuctions(query, callback) {
  const key = `auctions:${JSON.stringify(query)}`;
  cacheFunctions.read({ key }, (auctions) => {
    if (auctions) {
      logger.debug(`Cache hit for ${key}`);
      return callback(null, auctions);
    }
    executeQuery(query, (error, data) => {
      if (error) {
        callback(error);
      }
      cacheAuctions(data, key, (auctions) => callback(null, auctions));
    });
  });
}

function queryAuctionId(from, to, itemId, callback) {
  const now = Date.now();
  from = from || (now - 24 * 60 * 60 * 1000);
  to = to || now;

  if (typeof from === 'string') {
    from = parseTimestamp(from);
  }

  if (typeof to === 'string') {
    to = parseTimestamp(to);
  }

  if (Number.isNaN(Number(from)) || Number.isNaN(Number(to))) {
    return callback({ error: "parameters 'from' and 'to' must be integers" });
  }
  redis.zrangebyscore(itemId, from, to, (error, auctions) => {
    if (error) {
      logger.error(error);
    }
    const object = {
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
      object.auctions[auction.end] = auction;
    });
    object.average_price = average(priceArray);
    object.median_price = median(priceArray);
    object.standard_deviation = stdDev(priceArray);
    object.min_price = min(priceArray);
    object.max_price = max(priceArray);
    object.sold = priceArray.length;
    return callback(null, object);
  });
}

module.exports = { getAuctions, queryAuctionId };
