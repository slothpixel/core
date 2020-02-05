const redis = require('./redis');
const { logger } = require('../util/utility');

module.exports = {
  read: (req, cb) => {
    logger.info(`[READCACHE] cache:${req.key}`);
    redis.get(`cache:${req.key}`, (err, data) => {
      if (err) {
        logger.error(`[READCACHE] Error: ${err}`);
      }
      let res = null;
      try {
        res = JSON.parse(data);
      } catch (e) {
        logger.error(`[READCACHE] Failed parsing cache JSON: ${e}`);
      }
      cb(res);
    });
  },
  write: (req, data, cb) => {
    logger.info(`[WRITECACHE] cache:${req.key}`);
    if (data === undefined) {
      return logger.warn('[WRITECACHE] Cache data is undefined! This should never happen');
    }
    let string;
    try {
      string = JSON.stringify(data);
    } catch (e) {
      return logger.error(`[WRITECACHE] Failed to stringify JSON: ${e}`);
    }
    return redis.setex(`cache:${req.key}`, req.duration, string, cb);
  },
};
