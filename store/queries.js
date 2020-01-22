/* eslint-disable no-unused-vars,consistent-return,prefer-arrow-callback,func-names */
const db = require('./db');
const redis = require('./redis');
const { logger } = require('../util/utility');
const lbTemplates = require('../store/lb-templates');
const {
  Player, Guild, Auction,
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

function getPlayers(filter = {}, fields = null, options = {}, cb) {
  Player.find(filter, fields, options, (err, res) => {
    if (err) {
      logger.error(err);
    }
    cb(err, res.map(model => model.toObject()));
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

function removeGuild(id) {
  Guild.findOneAndRemove({ id }, (err) => {
    if (err) {
      logger.error(err);
    }
  });
}

function insertAuction(auction, cb) {
  Auction.findOneAndUpdate({ uuid: auction.uuid }, auction, { new: true, upsert: true }, function (err) {
    if (err) {
      logger.error(err);
    }
    return cb(err);
  });
}

function bulkWrite(type, ops, options = {}, cb) {
  let Model;
  switch (type) {
    default:
    case 'player':
      Model = Player;
      break;
    case 'guild':
      Model = Guild;
      break;
    case 'auction':
      Model = Auction;
  }
  Model.collection.bulkWrite(ops, options, (err, res) => {
    if (err) {
      return cb(err, null);
    }
    logger.debug(`[bulkWrite ${type}] nUpserted: ${res.nUpserted} nModified: ${res.nModified}`);
  });
}

function getAuctions(filter, fields = null, options, cb) {
  Auction.find(filter, fields, options, (err, res) => {
    if (err) {
      return cb(err, null);
    }
    cb(null, res.map(model => model.toObject()));
  });
}

function getItems(cb) {
  Auction.distinct('item.attributes.id', function (err, ids) {
    if (err) {
      return cb(err, null);
    }
    cb(null, ids);
  });
}

function getMetadata(req, callback) {
  // TODO - Add API status
  callback(null, { leaderboards: lbTemplates });
}

module.exports = {
  insertPlayer,
  getPlayer,
  getPlayers,
  cachePlayerProfile,
  getPlayerProfile,
  insertGuild,
  getGuild,
  getGuildByPlayer,
  removeGuild,
  insertAuction,
  bulkWrite,
  getAuctions,
  getItems,
  getMetadata,
};
