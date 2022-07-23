/**
Interface to Redis client.
*/
const Redis = require('ioredis');
const { logger } = require('../util/utility');
const config = require('../config');

logger.info(`connecting ${config.REDIS_URL}`);
const client = new Redis(config.REDIS_URL, {
  enableAutoPipelining: true,
});

const numbers = new Set(['start', 'end', 'starting_bid', 'highest_bid_amount', 'last_updated']);
const jsons = new Set(['coop', 'claimed_bidders', 'bids', 'item']);
const bools = new Set(['claimed', 'bin']);

/*
* Modified default ReplyTransformer that also converts values to correct datatypes
 */
Redis.Command.setReplyTransformer('hgetall', (result) => {
  if (Array.isArray(result)) {
    const object = {};
    for (let i = 0; i < result.length; i += 2) {
      const key = result[i];
      let value = result[i + 1];
      if (jsons.has(key)) {
        try {
          value = JSON.parse(value);
        } catch {
          // do nothing
        }
      } else {
        value = value.replace(/"/g, '');
      }
      if (numbers.has(key)) {
        value = Number(value);
      }
      if (bools.has(key)) {
        value = value === 'true';
      }
      object[key] = value;
    }
    return object;
  }
  return result;
});

client.on('error', (error) => {
  logger.error(error);
  process.exit(1);
});
module.exports = client;
