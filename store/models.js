const mongoose = require('mongoose');

const PlayerSchema = mongoose.Schema({}, { strict: false, timestamps: true });
const GuildSchema = mongoose.Schema({}, { strict: false, timestamps: true });

const Player = mongoose.model(PlayerSchema);
const Guild = mongoose.model(GuildSchema);

module.exports = {
  Player,
  Guild,
};
