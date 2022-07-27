/* eslint-disable consistent-return */
/*
* Allows custom DB queries for auctions API endpoint
 */
// const cachedFunction = require('./cachedFunction');
const redis = require('./redis');
const { logger, redisBulk } = require('../util/utility');
// const {
//   min, max, median, average, standardDeviation,
// } = require('../util/math');
// const parseTimestamp = require('../util/readableTimestamps');

/*
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
 */

async function returnWithMeta(result, matching) {
  let meta = await redis.get('auction_meta');
  try {
    meta = JSON.parse(meta);
  } catch (error) {
    logger.warn(`Failed parsing auction meta: ${error}`);
  }

  return {
    last_updated: meta.lastUpdated || null,
    total_auctions: meta.totalAuctions || 0,
    matching_query: matching,
    auctions: result,
  };
}

async function getAuctions({
  auctionUUID = null,
  id = null,
  bin = null,
  category = null,
  rarity = null,
  sortBy = 'end',
  sortOrder = 'desc',
  limit = 1000,
  page = 1,
}) {
  const pageSize = Math.min(1000, Number.parseInt(limit, 10));
  const intersection = ['auction_ids'];

  if (auctionUUID) {
    const auction = JSON.parse(await redis.hget(`auction:${auctionUUID}`, 'json'));
    const result = auction !== null ? [auction] : [];
    return returnWithMeta(result, result.length);
  }

  if (bin === 'true') {
    intersection.push('auction_bins');
  }
  if (id) {
    intersection.push(`auction_item_id:${id}`);
  }
  if (category) {
    intersection.push(`auction_category:${category}`);
  }
  if (rarity) {
    intersection.push(`auction_rarity:${rarity}`);
  }

  let ids = await redis.zinter(intersection.length, intersection);
  let matching = ids.length;

  // The zset `auction_ids` is sorted by end date automatically
  if (sortBy === 'end') {
    if (sortOrder === 'asc') {
      ids.reverse();
    }
    ids = ids.slice((page - 1) * pageSize, page * pageSize);
  }

  let auctions = await redisBulk(redis, 'hget', ids, 'auction', ['json']);

  // Remove empty entries and remove error entries
  auctions = auctions.filter(([, a]) => a !== null).map(([, a]) => JSON.parse(a));

  // filter
  if (bin === 'false') {
    auctions = auctions.filter((a) => !a.bin);
    matching = auctions.length;
  }

  // sort
  function sort(a, b) {
    if (sortOrder === 'asc') {
      return a[sortBy] - b[sortBy];
    }
    return b[sortBy] - a[sortBy];
  }

  if (sortBy !== 'end') {
    if (auctions.length > 0 && auctions[0]?.[sortBy] === undefined) {
      throw new Error(`Can't sort by ${sortBy}`);
    }
    auctions = auctions.sort(sort);
    auctions = auctions.slice((page - 1) * pageSize, page * pageSize);
  }

  return returnWithMeta(auctions, matching);
}

module.exports = { getAuctions };
