/*
* Worker to automatically update player stats at random
*/
const async = require('async');
const { invokeInterval } = require('../util/utility');
const { getPlayers } = require('../store/queries');
const buildPlayer = require('../store/buildPlayer');

function updatePlayers(cb) {
  const now = Date.now();
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
    async.eachLimit(players, 10, (p, cb) => {
      buildPlayer(p.uuid, (err) => {
        if (err) {
          cb(err);
        }
        cb();
      });
    }, cb);
  });
}

invokeInterval(updatePlayers, 60 * 1000);
