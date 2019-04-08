const mongoose = require('mongoose');

const options = {
  strict: false,
  timestamps: true,
  id: false,
};

const PlayerSchema = mongoose.Schema({}, options);
const GuildSchema = mongoose.Schema({}, options);

const Player = mongoose.model('PlayerSchema', PlayerSchema);
const Guild = mongoose.model('GuildSchema', GuildSchema);

module.exports = {
  Player,
  Guild,
};
