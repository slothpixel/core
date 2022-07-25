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

client.on('error', (error) => {
  logger.error(error);
  process.exit(1);
});
module.exports = client;
