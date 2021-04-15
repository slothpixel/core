/* eslint-disable consistent-return,camelcase */
/*
* Functions that handle creating, caching and storing SkyBlock profile data
 */
const redis = require('./redis');
const processSkyBlock = require('../processors/processSkyBlock');
const cachedFunction = require('./cachedFunction');
// const { insertSkyBlockProfile } = require('./queries');
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
    await redis.setex(key, 3 * 24 * 60 * 60, JSON.stringify(profiles)); // Expire after 3 days
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
    profiles.forEach((profile) => {
      const { cute_name, members } = profile;
      newProfiles[profile.profile_id] = { cute_name, ...getStats(members[uuid] || {}, members) };
    });
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
  // If no id is specified, use last played profile
  if (id === null) {
    [profile_id] = getLatestProfile(profiles);
  } else if (id.length < 32) {
    profile_id = Object.keys(profiles).find((profile) => profiles[profile].cute_name.toLowerCase() === id.toLowerCase()) || null;
  }

  if (profile_id === null || profile_id.length !== 32) {
    throw new Error('Profile not found!');
  }

  // eslint-disable-next-line arrow-body-style
  const returnedProfile = await cachedFunction(`skyblock_profile:${profile_id}`, async () => {
    // insertSkyBlockProfile(profile);

    return getProfileData(profile_id);
  }, { cacheDuration: 600 });
  returnedProfile.cute_name = profiles[profile_id].cute_name || ''; // add profile name to the end of the profile
  return returnedProfile; // return appended profile object
}

module.exports = {
  buildProfileList,
  buildProfile,
};
