/*
* Worker to automatically update player and guild stats at random
*/
const async = require('async');
const { logger, invokeInterval } = require('../util/utility');
const { getPlayers, getGuilds, bulkWrite } = require('../store/queries');
const { getGuildData } = require('../store/buildGuild');
const buildPlayer = require('../store/buildPlayer');

function updatePlayers(cb) {
  const now = Date.now();
  function upsertDoc(id, update) {
    return {
      updateOne: {
        update: { $set: update },
        filter: (update.uuid)
          ? { uuid: id }
          : { id },
      },
    };
  }
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
  getPlayers(playerFilter, 'uuid', { limit: 100 }, (err, players) => {
    if (err) {
      cb(err);
    }
    async.mapLimit(players, 10, (p, cb) => {
      buildPlayer({
        uuid: p.uuid,
        caching: {
          cacheResult: false,
        },
      }, (err, player) => {
        if (err) {
          cb(err);
        }
        cb(null, upsertDoc(p.uuid, player));
      });
    }, (err, bulkPlayerOps) => {
      if (err) {
        cb(err);
      }
      if (bulkPlayerOps.length === 0) cb();
      bulkWrite('player', bulkPlayerOps, { ordered: false }, (err) => {
        logger.error(`bulkWrite failed: ${err}`);
        cb();
      });
    });
  });
  getGuilds(guildFilter, 'id', { limit: 20 }, (err, guilds) => {
    if (err) {
      cb(err);
    }
    async.mapLimit(guilds, 5, (g, cb) => {
      getGuildData(g.id, (err, guild) => {
        if (err) {
          cb(err);
        }
        cb(null, upsertDoc(g.id, guild));
      });
    }, (err, bulkGuildOps) => {
      if (err) {
        cb(err);
      }
      if (bulkGuildOps.length === 0) cb();
      bulkWrite('guild', bulkGuildOps, { ordered: false }, (err) => {
        logger.error(`bulkWrite failed: ${err}`);
        cb();
      });
    });
  });
}

invokeInterval(updatePlayers, 60 * 1000);
