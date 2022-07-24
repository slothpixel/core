const redis = require('./redis');
const { logger } = require('../util/utility');
const lbTemplates = require('./lbTemplates');

async function cachePlayerProfile(profile) {
  const key = `profile:${profile.uuid}`;
  profile.updated_at = Date.now();
  logger.debug(`Caching ${key}`);
  try {
    await redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(profile));
  } catch (error) {
    logger.error(error);
  }
  return profile;
}

async function getPlayerProfile(uuid) {
  let reply = null;
  const key = `profile:${uuid}`;
  logger.debug(`Trying to get profile ${uuid} from cache`);
  try {
    reply = await redis.get(key);
  } catch (error) {
    logger.error(`Failed to get profile: ${error}`);
  }
  if (reply) {
    logger.debug(`Cache hit for profile ${uuid}`);
    return JSON.parse(reply);
  }
  return reply;
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
