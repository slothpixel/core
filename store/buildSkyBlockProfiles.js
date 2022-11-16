/* eslint-disable consistent-return,camelcase */
/*
* Functions that handle creating, caching and storing SkyBlock profile data
 */
const redis = require('./redis');
const processSkyBlock = require('../processors/processSkyBlock');
// const { insertSkyBlockProfile } = require('./queries');
const { logger, generateJob, getData } = require('../util/utility');

function getLatestProfile(profiles) {
  return Object.entries(profiles).find(([profile]) => profiles[profile].selected);
}

async function updateProfileList(key, profiles) {
  try {
    await redis.setex(key, 600, JSON.stringify(profiles)); // Expire after 10 minutes
  } catch (error) {
    logger.error(`Failed to update profile list: ${error}`);
  }
}

/*
Create or update list of profiles
*/
async function buildProfileList(uuid) {
  const key = `skyblock_profiles:${uuid}`;
  const newProfiles = {};
  try {
    const body = await getData(redis, generateJob('skyblock_profiles', {
      id: uuid,
    }).url);
    const { profiles } = body;
    if (profiles === null) {
      return {};
    }
    await Promise.all(profiles.map(async (profile) => {
      const { profile_id } = profile;
      newProfiles[profile_id] = { ...await processSkyBlock(profile) };
    }));
    updateProfileList(key, newProfiles);
    return newProfiles;
  } catch (error) {
    logger.error(`Failed getting skyblock profiles: ${error.message}`);
  }
}

async function buildProfile(uuid, id = null) {
  const result = await redis.get(`skyblock_profiles:${uuid}`);
  let profile_id = id;
  let profiles = {};

  if (result) {
    profiles = JSON.parse(result);
  } else {
    profiles = await buildProfileList(uuid);
  }
  if (Object.entries(profiles).length === 0) {
    return {};
  }
  // If no id is specified, use last played profile
  if (id === null) {
    [profile_id] = getLatestProfile(profiles);
  } else if (id.length < 32) {
    profile_id = Object.keys(profiles).find((profile) => profiles[profile].cute_name.toLowerCase() === id.toLowerCase()) || null;
  }

  if (profile_id === null || profile_id.length !== 32) {
    throw new Error('Profile not found!');
  }

  if (profile_id in profiles) {
    return profiles[profile_id];
  }

  return {};
}

module.exports = {
  buildProfileList,
  buildProfile,
};
