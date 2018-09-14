const mongoose = require('mongoose');
const config = require('../config');

const settings = {
  useNewUrlParser: true,
  autoIndex: false,
};

const db = mongoose.connect(config.MONGODB_URL, settings, (err) => {
  console.log('connecting %s', config.MONGODB_URL);
  if (err) {
    console.log('failed db connection: %s', err);
  }
});

module.exports = db;
