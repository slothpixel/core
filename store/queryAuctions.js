/* eslint-disable consistent-return */
/*
* Allows custom DB queries for auctions API endpoint
 */
const pify = require('pify');
const config = require('../config');
const cachedFunction = require('./cachedFunction');
const redis = pify(require('./redis'));
const { logger } = require('../util/utility');
const {
  min, max, median, average, standardDeviation,
} = require('../util/math');
const parseTimestamp = require('../util/readableTimestamps');

/*
* Allows some filtering with simple parameters instead of user
* having to create MongoDB queries, stringifying and decoding them...
 */
function createFilterQuery({
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

async function executeQuery(query) {
  const { error } = createQuery(query, createFilterQuery(query));
  if (error) {
    throw new Error(error);
  }

  try {
    const result = {}; // await findAuction(filter, null, options)
    return transformData(result);
  } catch {
    throw new Error('Query failed');
  }
}

async function getAuctions(query) {
  return cachedFunction(`auctions:${JSON.stringify(query)}`, async () => executeQuery(query), { shouldCache: config.ENABLE_AUCTION_CACHE, cacheDuration: config.AUCTION_CACHE_SECONDS });
}

async function queryAuctionId(from, to, showAuctions = false, itemId) {
  const now = Date.now();
  let fromDate = from || (now - 24 * 60 * 60 * 1000);
  let toDate = to || now;

  if (typeof from === 'string') {
    fromDate = parseTimestamp(from);
  }

  if (typeof to === 'string') {
    toDate = parseTimestamp(to);
  }

  if (Number.isNaN(Number(fromDate)) || Number.isNaN(Number(toDate))) {
    throw new TypeError("Parameters 'from' and 'to' must be integers");
  }
  return cachedFunction(`auctions:${itemId}:${from}:${to}`, async () => {
    try {
      const auctions = await redis.zrangebyscore(itemId, fromDate, toDate);
      const result = {
        average_price: 0,
        median_price: 0,
        standard_deviation: 0,
        min_price: 0,
        max_price: 0,
        lowest_bin: 0,
        sold: 0,
        auctions: {},
      };
      const priceArray = [];
      const binArray = [];
      auctions.forEach((auction) => {
        auction = JSON.parse(auction);
        const { bids } = auction;
        if (bids.length > 0) priceArray.push(bids[bids.length - 1].amount / auction.item.count);
        if ('bin' in auction && auction.bin) binArray.push(auction.starting_bid / auction.item.count);
        result.auctions[auction.end] = auction;
      });
      result.average_price = average(priceArray);
      result.median_price = median(priceArray);
      result.standard_deviation = standardDeviation(priceArray);
      result.min_price = min(priceArray);
      result.max_price = max(priceArray);
      result.lowest_bin = min(binArray) || 0;
      result.sold = priceArray.length;
      if (!showAuctions) {
        delete result.auctions;
      }
      return result;
    } catch (error) {
      logger.error(error);
    }
  }, { cacheDuration: 60 });
}

module.exports = { getAuctions, queryAuctionId };
