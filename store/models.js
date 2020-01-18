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
const AuctionSchema = mongoose.Schema({
  uuid: String,
  start: Number,
  end: Number,
  tier: String,
  category: String,
  item: {
    item_id: Number,
    name: String,
    lore: Array,
    count: {
      type: Number,
      default: 1,
    },
    attributes: {
      modifier: String,
      enchantments: Object,
      origin: String,
      id: String,
      uuid: String,
      texture: String,
    },
  },
  starting_bid: Number,
  highest_bid: Number,
  bids: {
    type: [{
      _id: false,
      bidder: String,
      profile_id: String,
      amount: Number,
      timestamp: Number,
    }],
  },
  highest_bid_amount: Number,
});

PlayerSchema.index({ uuid: 1 });
GuildSchema.index({ id: 1 });
AuctionSchema.index({ 'item.attributes.id': 1 });

const Player = mongoose.model('Player', PlayerSchema);
const Guild = mongoose.model('Guild', GuildSchema);
const Auction = mongoose.model('Auction', AuctionSchema);

module.exports = {
  Player,
  Guild,
  Auction,
};
