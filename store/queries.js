/* eslint-disable no-unused-vars,consistent-return,prefer-arrow-callback,func-names */
const db = require('./db');
const redis = require('./redis');
const { logger } = require('../util/utility');
const { profileFields } = require('../store/profileFields');
const lbTemplates = require('../store/lb-templates');
const {
  Player, Guild,
} = require('../store/models');

function insertPlayer(uuid, player, cb) {
  Player.findOneAndUpdate({ uuid }, player, { new: true, upsert: true }, function (err) {
    if (err) {
      logger.error(err);
    }
    return cb(err, player);
  });
}

function getPlayer(uuid, cb) {
  Player.findOne({ uuid }, function (err, player) {
    if (err) {
      logger.error(err);
    }
    return cb(err, player);
  });
}

function cachePlayerProfile(profile, cb) {
  const key = `profile:${profile.uuid}`;
  logger.debug(`Caching ${key}`);
  redis.set(key, JSON.stringify(profile), (err) => {
    if (err) {
      logger.error(err);
    }
    cb(profile);
  });
}

function getPlayerProfile(uuid, cb) {
  const key = `profile:${uuid}`;
  logger.debug(`Trying to get profile ${uuid} from cache`);
  redis.get(key, (err, reply) => {
    if (err) {
      logger.error(err);
    }
    if (reply) {
      logger.debug(`Cache hit for profile ${uuid}`);
      return cb(err, JSON.parse(reply), true);
    }
    return cb(null, null, false);
  });
}

function insertGuild(id, guild, cb) {
  Guild.findOneAndUpdate({ id }, guild, { new: true, upsert: true }, function (err) {
    if (err) {
      logger.error(err);
    }
    return cb(err, guild);
  });
}

function getGuild(id, cb) {
  Guild.findOne({ id }, function (err, guild) {
    if (err) {
      logger.error(err);
    }
    return cb(err, guild);
  });
}

function getGuildByPlayer(uuid, cb) {
  Guild.findOne({ 'members.uuid': uuid }, function (err, guild) {
    if (err) {
      logger.error(err);
    }
    if (guild === null) {
      return cb(err, null);
    }
    return cb(err, guild.toObject());
  });
}

function getMetadata(req, callback) {
  // TODO - Add API status
  callback(null, { leaderboards: lbTemplates });
}

module.exports = {
  insertPlayer,
  getPlayer,
  cachePlayerProfile,
  getPlayerProfile,
  insertGuild,
  getGuild,
  getGuildByPlayer,
  getMetadata,
};
