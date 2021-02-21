const redis = require('./redis');
const { logger } = require('../util/utility');
const lbTemplates = require('./lbTemplates');

async function cachePlayerProfile(profile) {
  const key = `profile:${profile.uuid}`;
  logger.debug(`Caching ${key}`);
  try {
    await redis.set(key, JSON.stringify(profile));
  } catch (error) {
    logger.error(error);
  }
  return profile;
}

function getPlayerProfile(uuid, callback) {
  const key = `profile:${uuid}`;
  logger.debug(`Trying to get profile ${uuid} from cache`);
  redis.get(key, (error, reply) => {
    if (error) {
      logger.error(error);
    }
    if (reply) {
      logger.debug(`Cache hit for profile ${uuid}`);
      return callback(error, JSON.parse(reply), true);
    }
    return callback(null, null, false);
  });
}

function getMetadata(request, callback) {
  // TODO - Add API status
  callback(null, { leaderboards: lbTemplates });
}

module.exports = {
  cachePlayerProfile,
  getPlayerProfile,
  getMetadata,
};
