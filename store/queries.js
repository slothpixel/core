/* eslint-disable no-unused-vars,consistent-return,prefer-arrow-callback,func-names */
const pify = require('pify');
const db = require('./db');
const redis = require('./redis');
const { logger } = require('../util/utility');
const lbTemplates = require('./lbTemplates');
const {
  Player, Guild, SkyBlockProfile, Auction,
} = require('./models');

const playerFindOneAndUpdateAsync = pify(Player.findOneAndUpdate).bind(Player);
const guildFindOneAndUpdateAsync = pify(Guild.findOneAndUpdate).bind(Guild);
const guildFindOne = pify(Guild.findOne).bind(Guild);

function insertPlayer(uuid, player) {
  playerFindOneAndUpdateAsync({ uuid }, player, { new: true, upsert: true });
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
    cb(err, res.map((model) => model.toObject()));
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

async function insertGuild(id, guild) {
  await guildFindOneAndUpdateAsync({ id }, guild, { new: true, upsert: true });
  return guild;
}

function getGuild(id, cb) {
  Guild.findOne({ id }, function (err, guild) {
    if (err) {
      logger.error(err);
    }
    return cb(err, guild);
  });
}
function getGuilds(filter = {}, fields = null, options = {}, cb) {
  Guild.find(filter, fields, options, (err, res) => {
    if (err) {
      logger.error(err);
    }
    cb(err, res.map((model) => model.toObject()));
  });
}

async function getGuildByPlayer(uuid) {
  try {
    const guild = await guildFindOne({ 'members.uuid': uuid });
    if (guild === null) {
      return null;
    }
    return guild.toObject();
  } catch (err) {
    logger.error(err);
  }
}

function removeGuild(id) {
  Guild.findOneAndRemove({ id }, (err) => {
    if (err) {
      logger.error(err);
    }
  });
}

async function insertSkyBlockProfile(profile) {
  try {
    await pify(SkyBlockProfile.findOneAndUpdate).bind(SkyBlockProfile)({ profile_id: profile.profile_id }, profile, { new: true, upsert: true });
  } catch (error) {
    logger.error(error);
  }
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
    cb(null, res.map((model) => model.toObject()));
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
  getGuilds,
  getGuildByPlayer,
  removeGuild,
  insertSkyBlockProfile,
  insertAuction,
  bulkWrite,
  getAuctions,
  getItems,
  getMetadata,
};
