/* eslint-disable consistent-return */
/*
* Allows custom DB queries for auctions API endpoint
 */
const config = require('../config');
const cacheFunctions = require('../store/cacheFunctions');
const { logger } = require('../util/utility');
const { Auction } = require('../store/models');

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
  sortBy = 'end', limit = 100, filter = '{}', active = true, page = 0,
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
  return {
    filter: filterObj,
    options: {
      limit: Number(limit),
      skip: page * limit,
      sort: {
        [sortBy]: -1,
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
      cacheAuctions(data, key, auctions => cb(null, auctions));
    });
  });
}

module.exports = getAuctions;
