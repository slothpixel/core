/* eslint-disable no-unused-vars,consistent-return,prefer-arrow-callback,func-names */
const pify = require('pify');
const database = require('./database');
const redis = require('./redis');
const { logger } = require('../util/utility');
const lbTemplates = require('./lbTemplates');
const {
  Player, Guild, SkyBlockProfile, Auction,
} = require('./models');

const setAsync = pify(redis.set).bind(redis);

const playerFindOneAndUpdateAsync = pify(Player.findOneAndUpdate).bind(Player);
const guildFindOneAndUpdateAsync = pify(Guild.findOneAndUpdate).bind(Guild);
const guildFindOne = pify(Guild.findOne).bind(Guild);

function insertPlayer(uuid, player) {
  playerFindOneAndUpdateAsync({ uuid }, player, { new: true, upsert: true });
}

function getPlayer(uuid, callback) {
  Player.findOne({ uuid }, function (error, player) {
    if (error) {
      logger.error(error);
    }
    return callback(error, player);
  });
}

function getPlayers(filter = {}, fields = null, options = {}, callback) {
  Player.find(filter, fields, options, (error, result) => {
    if (error) {
      logger.error(error);
    }
    callback(error, result.map((model) => model.toObject()));
  });
}

async function cachePlayerProfile(profile) {
  const key = `profile:${profile.uuid}`;
  logger.debug(`Caching ${key}`);
  try {
    await setAsync(key, JSON.stringify(profile));
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

async function insertGuild(id, guild) {
  await guildFindOneAndUpdateAsync({ id }, guild, { new: true, upsert: true });
  return guild;
}

function getGuild(id, callback) {
  Guild.findOne({ id }, function (error, guild) {
    if (error) {
      logger.error(error);
    }
    return callback(error, guild);
  });
}
function getGuilds(filter = {}, fields = null, options = {}, callback) {
  Guild.find(filter, fields, options, (error, result) => {
    if (error) {
      logger.error(error);
    }
    callback(error, result.map((model) => model.toObject()));
  });
}

async function getGuildByPlayer(uuid) {
  try {
    const guild = await guildFindOne({ 'members.uuid': uuid });
    if (guild === null) {
      return null;
    }
    return guild.toObject();
  } catch (error) {
    logger.error(error);
  }
}

function removeGuild(id) {
  Guild.findOneAndRemove({ id }, (error) => {
    if (error) {
      logger.error(error);
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

function insertAuction(auction, callback) {
  Auction.findOneAndUpdate({ uuid: auction.uuid }, auction, { new: true, upsert: true }, function (error) {
    if (error) {
      logger.error(error);
    }
    return callback(error);
  });
}

function bulkWrite(type, ops, options = {}, callback) {
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
  Model.collection.bulkWrite(ops, options, (error, result) => {
    if (error) {
      return callback(error, null);
    }
    logger.debug(`[bulkWrite ${type}] nUpserted: ${result.nUpserted} nModified: ${result.nModified}`);
  });
}

function getAuctions(filter, fields = null, options, callback) {
  Auction.find(filter, fields, options, (error, result) => {
    if (error) {
      return callback(error, null);
    }
    callback(null, result.map((model) => model.toObject()));
  });
}

function getItems(callback) {
  Auction.distinct('item.attributes.id', function (error, ids) {
    if (error) {
      return callback(error, null);
    }
    callback(null, ids);
  });
}

function getMetadata(request, callback) {
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
