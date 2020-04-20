/* eslint-disable consistent-return,camelcase */
/*
* Functions that handle creating, caching and storing SkyBlock profile data
 */
const async = require('async');
const redis = require('./redis');
const processSkyBlock = require('../processors/processSkyBlock');
const cacheFunctions = require('./cacheFunctions');
// const { buildPlayer } = require('../store/buildPlayer');
const { insertSkyBlockProfile } = require('./queries');
const { logger, generateJob, getData } = require('../util/utility');

function cacheProfile(key, profile, cb) {
  cacheFunctions.write({
    key,
    duration: 600,
  }, profile);
  insertSkyBlockProfile(profile);
  cb(profile);
}

function getProfileData(id, cb) {
  const { url } = generateJob('skyblock_profile', {
    id,
  });
  getData(redis, url, (err, body) => {
    if (err) {
      logger.error(`Failed getting skyblock profile: ${err.message}`);
    }
    processSkyBlock((body || {}).profile || {}, (profile) => cb(null, profile));
  });
}

function getLatestProfile(profiles) {
  return Object.entries(profiles).sort((a, b) => b[1].last_save - a[1].last_save)[0];
}

function updateProfileList(key, profiles) {
  redis.set(key, JSON.stringify(profiles), (err) => {
    if (err) {
      logger.error(err);
    }
  });
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

function buildProfile(uuid, id = null, shouldUpdateProfileList = true, cb) {
  redis.get(`skyblock_profiles:${uuid}`, (err, res) => {
    if (err) {
      return cb(err);
    }
    let profile_id = id;
    let profiles = {};
    if (res) {
      profiles = JSON.parse(res);
      // If no id is specified, use last played profile
      if (id === null) {
        [profile_id] = getLatestProfile(profiles);
      } else if (id.length < 32) {
        profile_id = Object.keys(profiles).find((profile) => profiles[profile].cute_name.toLowerCase() === id.toLowerCase()) || null;
      }
    } else {
      // buildPlayer(uuid, () => {});
    }
    if (profile_id === null) {
      return cb('Profile not found!');
    }
    const key = `skyblock_profile:${profile_id}`;
    cacheFunctions.read({ key }, (profile) => {
      if (profile) {
        return cb(null, profile);
      }
      if (profile_id.length !== 32) {
        return cb('Profile not found!');
      }
      getProfileData(profile_id, (err, profile) => {
        if (err) {
          return cb(err);
        }
        if (shouldUpdateProfileList) {
          profiles[profile_id] = Object.assign(profiles[profile_id], getStats(profile.members[uuid] || {}, profile.members));
          updateProfileList(`skyblock_profiles:${uuid}`, profiles);
        }
        cacheProfile(key, profile, (profile) => cb(null, profile || {}));
      });
    });
  });
}

/*
* Create or update list of profiles
 */
function buildProfileList(uuid, profiles = {}) {
  const key = `skyblock_profiles:${uuid}`;
  redis.get(key, (err, res) => {
    if (err) {
      return logger.error(`Failed getting profile list hash from redis: ${err}`);
    }
    const p = JSON.parse(res) || {};
    // TODO - Mark old profiles
    const updateQueue = Object.keys(profiles).filter((id) => !(id in p));
    if (updateQueue.length === 0) return;
    async.each(updateQueue, (id, cb) => {
      buildProfile(uuid, id, false, (err, profile) => {
        p[id] = Object.assign(profiles[id], getStats(profile.members[uuid] || {}, profile.members));
        cb();
      });
    }, () => updateProfileList(key, p));
  });
}

module.exports = {
  buildProfile,
  buildProfileList,
};
