const mongoose = require('mongoose');
const config = require('../config');
const { logger } = require('../util/utility');

const settings = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  autoIndex: config.NODE_ENV === 'development',
};

mongoose.connect(config.MONGODB_URL, settings, (error) => {
  logger.info(`connecting ${config.MONGODB_URL}`);
  if (error) {
    logger.error(`failed db connection: ${error}`);
  }
});

module.exports = mongoose.connection;
