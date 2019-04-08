const mongoose = require('mongoose');
const config = require('../config');
const { logger } = require('../util/utility');

const settings = {
  useNewUrlParser: true,
  autoIndex: false,
};

const db = mongoose.connect(config.MONGODB_URL, settings, (err) => {
  mongoose.set('useFindAndModify', false);
  logger.info(`connecting ${config.MONGODB_URL}`);
  if (err) {
    logger.error(`failed db connection: ${err}`);
  }
});

module.exports = db;
