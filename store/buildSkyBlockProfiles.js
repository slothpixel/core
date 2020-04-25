/* eslint-disable consistent-return,camelcase */
/*
* Functions that handle creating, caching and storing SkyBlock profile data
 */
const async = require('async');
const pify = require('pify');
const redis = require('./redis');
const processSkyBlock = require('../processors/processSkyBlock');
const cachedFunction = require('./cachedFunction');
const { insertSkyBlockProfile } = require('./queries');
const { logger, generateJob, getData } = require('../util/utility');

async function getProfileData(id) {
  try {
    const body = await getData(redis, generateJob('skyblock_profile', {
      id,
    }).url);
    return processSkyBlock((body || {}).profile || {});
  } catch (error) {
    logger.error(`Failed getting skyblock profile: ${error.message}`);
  }
}

function getLatestProfile(profiles) {
  return Object.entries(profiles).sort((a, b) => b[1].last_save - a[1].last_save)[0];
}

async function updateProfileList(key, profiles) {
  try {
    await pify(redis.set)(key, JSON.stringify(profiles));
  } catch (error) {
    logger.error(`Failed to update profile list: ${error}`);
  }
}

// Destruct some properties from profiles for overview
function getStats({
  first_join = null,
  last_save = null,
  collections_unlocked = 0,
}, members = {}) {
  return {
    first_join,
    last_save,
    collections_unlocked,
    members: Object.keys(members),
  };
}

async function buildProfile(uuid, id = null, { shouldUpdateProfileList = true } = {}) {
  const result = await pify(redis.get)(`skyblock_profiles:${uuid}`);
  let profile_id = id;
  let profiles = {};

  if (result) {
    profiles = JSON.parse(result);
    // If no id is specified, use last played profile
    if (id === null) {
      [profile_id] = getLatestProfile(profiles);
    } else if (id.length < 32) {
      profile_id = Object.keys(profiles).find((profile) => profiles[profile].cute_name.toLowerCase() === id.toLowerCase()) || null;
    }
  }

  if (profile_id === null || profile_id.length !== 32) {
    throw new Error('Profile not found!');
  }

  return cachedFunction(`skyblock_profile:${profile_id}`, async () => {
    const profile = await getProfileData(profile_id);
    profiles[profile_id] = Object.assign(profiles[profile_id], getStats(profile.members[uuid] || {}, profile.members));

    await insertSkyBlockProfile(profile);

    if (shouldUpdateProfileList) {
      await updateProfileList(`skyblock_profiles:${uuid}`, profiles);
    }

    return profile;
  }, { cacheDuration: 600 });
}

/*
Create or update list of profiles
*/
async function buildProfileList(uuid, profiles = {}) {
  const key = `skyblock_profiles:${uuid}`;
  try {
    const result = await pify(redis.get)(key);
    const profileData = JSON.parse(result) || {};

    // TODO: Mark old profiles
    const updateQueue = Object.keys(profiles).filter((id) => !profileData.includes(id));

    if (updateQueue.length === 0) {
      return;
    }

    await async.each(updateQueue, async (id) => {
      const profile = await buildProfile(uuid, id, { shouldUpdateProfileList: false });
      profileData[id] = { ...profiles[id], ...getStats(profile.members[uuid] || {}, profile.members) };
    });

    await updateProfileList(key, profileData);
  } catch (error) {
    logger.error(`Failed to get profile list hash from redis: ${error}`);
  }
}

module.exports = {
  buildProfile,
  buildProfileList,
};
