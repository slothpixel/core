const mongoose = require('mongoose');

const options = {
  strict: false,
  timestamps: true,
  id: false,
  toObject: {
    transform(doc, ret) {
      delete ret._id;
      return ret;
    },
  },
};

const PlayerSchema = mongoose.Schema({}, options);
const GuildSchema = mongoose.Schema({}, options);

const Player = mongoose.model('Player', PlayerSchema);
const Guild = mongoose.model('Guild', GuildSchema);

module.exports = {
  Player,
  Guild,
};
