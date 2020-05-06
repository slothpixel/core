/**
Interface to Redis client.
*/
const redis = require('redis');
const { logger } = require('../util/utility');
const config = require('../config');

logger.info(`connecting ${config.REDIS_URL}`);
const client = redis.createClient(config.REDIS_URL, {
  detect_buffers: true,
});
client.on('error', (error) => {
  logger.error(error);
  process.exit(1);
});
module.exports = client;
