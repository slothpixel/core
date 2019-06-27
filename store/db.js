const mongoose = require('mongoose');
const config = require('../config');
const { logger } = require('../util/utility');

const settings = {
  useNewUrlParser: true,
  useFindAndModify: false,
  autoIndex: false,
};

mongoose.connect(config.MONGODB_URL, settings, (err) => {
  logger.info(`connecting ${config.MONGODB_URL}`);
  if (err) {
    logger.error(`failed db connection: ${err}`);
  }
});

module.exports = mongoose.connection;
