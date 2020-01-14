/*
* Worker to automatically update player stats at random
*/
const async = require('async');
const { logger, invokeInterval } = require('../util/utility');
const { getPlayers, bulkWrite } = require('../store/queries');
const buildPlayer = require('../store/buildPlayer');

function updatePlayers(cb) {
  const now = Date.now();
  function upsertDoc(uuid, update) {
    return {
      updateOne: {
        update: { $set: update },
        filter: { uuid },
        upsert: true,
      },
    };
  }
  /*
  * In order to update, player data must be older than 12 hours
  * and they have had to logged on in the past month
  */
  const filter = {
    last_login: {
      $gt: now - 30 * 24 * 60 * 60 * 1000,
    },
    updatedAt: {
      $lt: new Date(now - 12 * 60 * 60 * 1000),
    },
  };
  getPlayers(filter, 'uuid', { limit: 100 }, (err, players) => {
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
      bulkWrite('player', bulkPlayerOps, { ordered: false }, (err) => {
        logger.error(`bulkWrite failed: ${err}`);
      });
      cb();
    });
  });
}

invokeInterval(updatePlayers, 60 * 1000);
