const db = require('../store/db');

const {
  Player, Guild,
} = require('../store/models');

function getPlayer(uuid, cb) {
  Player.findOne({ uuid }, (err, player) => {
    if (err) {
      return cb();
    }
    return cb(player);
  });
}

function getGuildByPlayer(uuid, cb) {
  Guild.findOne({ members: { $elemMatch: { uuid } } }, (err, guild) => {
    if (err) {
      return cb();
    }
    return cb(guild);
  });
}

module.exports = {
  getPlayer,
  getGuildByPlayer,
};
