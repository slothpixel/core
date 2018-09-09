const mongoose = require('mongoose');

const PlayerSchema = mongoose.Schema({}, { strict: false, timestamps: true });
const GuildSchema = mongoose.Schema({}, { strict: false, timestamps: true });

const Player = mongoose.model('PlayerSchema', PlayerSchema);
const Guild = mongoose.model('GuildSchema', GuildSchema);

module.exports = {
  Player,
  Guild,
};
