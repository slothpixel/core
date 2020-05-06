/*
* Worker to automatically update player and guild stats at random
*/
const async = require('async');
const { logger, invokeInterval } = require('../util/utility');
const { getPlayers, getGuilds, bulkWrite } = require('../store/queries');
const { getGuildData } = require('../store/buildGuild');
const { buildPlayer } = require('../store/buildPlayer');

function upsertDocument(id, update) {
  return {
    updateOne: {
      update: { $set: update },
      filter: (update.uuid)
        ? { uuid: id }
        : { id },
    },
  };
}

function updatePlayers(callback) {
  const now = Date.now();
  /*
  * In order to update, player data must be older than 12 hours
  * and they have had to logged on in the past month
  */
  const playerFilter = {
    last_login: {
      $gt: now - 30 * 24 * 60 * 60 * 1000,
    },
    updatedAt: {
      $lt: new Date(now - 12 * 60 * 60 * 1000),
    },
  };
  const guildFilter = {
    updatedAt: {
      $lt: new Date(now - 12 * 60 * 60 * 1000),
    },
  };
  getPlayers(playerFilter, 'uuid', { limit: 100 }, (error, players) => {
    if (error) {
      callback(error);
    }
    async.mapLimit(players, 10, (p, callback_) => {
      buildPlayer(p.uuid, { shouldCache: false }).then((player) => {
        upsertDocument(p.uuid, player);
      }).catch(callback_);
    }, (error, bulkPlayerOps) => {
      if (error) {
        callback(error);
      }
      if (bulkPlayerOps.length === 0) callback();
      bulkWrite('player', bulkPlayerOps, { ordered: false }, (error) => {
        logger.error(`bulkWrite failed: ${error}`);
        callback();
      });
    });
  });
  getGuilds(guildFilter, 'id', { limit: 20 }, (error, guilds) => {
    if (error) {
      callback(error);
    }
    async.mapLimit(guilds, 5, (g, callback_) => {
      getGuildData(g.id).then((guild) => {
        callback_(null, upsertDocument(g.id, guild));
      }).catch((error) => {
        callback_(error.message);
      });
    }, (error, bulkGuildOps) => {
      if (error) {
        callback(error);
      }
      if (bulkGuildOps.length === 0) callback();
      bulkWrite('guild', bulkGuildOps, { ordered: false }, (error) => {
        logger.error(`bulkWrite failed: ${error}`);
        callback();
      });
    });
  });
}

invokeInterval(updatePlayers, 60 * 1000);
