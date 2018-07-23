const mongoose = require('mongoose');
const config = require('../config');

const db =
  mongoose.connect(config.MONGODB_URL, { useMongoClient: true, autoIndex: false }, (err) => {
    console.log('connecting %s', config.MONGODB_URL);
    if (err) {
      console.log('failed db connection: %s', err);
    }
  });

module.exports = db;
