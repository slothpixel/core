/* eslint-disable no-unused-vars */
const db = require('./db');
const { logger } = require('../util/utility');
const { profileFields } = require('../store/profileFields');
const {
  Player, Guild,
} = require('../store/models');

function returnObject(doc) {
  if (doc !== null) {
    doc.toObject();
    delete doc._id;
    logger.debug(doc);
  }
  return doc;
}

function insertPlayer(uuid, player, cb) {
  Player.findOneAndUpdate({ uuid }, player, { upsert: true }, (err) => {
    if (err) {
      logger.error(err);
    }
    return cb(err, player);
  });
}

function getPlayer(uuid, cb) {
  Player.findOne({ uuid }, (err, player) => {
    if (err) {
      logger.error(err);
    }
    return cb(err, player);
  });
}

function getPlayerProfile(uuid, cb) {
  Player.findOne({ uuid }, profileFields, { projection: { _id: 0 } }, (err, player) => {
    if (err) {
      logger.error(err);
    }
    const object = returnObject(player);
    return cb(err, object);
  });
}

function insertGuild(id, guild, cb) {
  Guild.findOneAndUpdate({ id }, guild, { upsert: true }, (err) => {
    if (err) {
      logger.error(err);
    }
    return cb(err, guild);
  });
}

function getGuild(id, cb) {
  Guild.findOne({ id }, (err, guild) => {
    if (err) {
      logger.error(err);
    }
    return cb(err, guild);
  });
}

function getGuildByPlayer(uuid, cb) {
  Guild.findOne({ 'members.uuid': uuid }, (err, guild) => {
    if (err) {
      logger.error(err);
    }
    if (guild === null) {
      return cb(err, null);
    }
    return cb(err, guild.toObject());
  });
}

module.exports = {
  insertPlayer,
  getPlayer,
  getPlayerProfile,
  insertGuild,
  getGuild,
  getGuildByPlayer,
};
