const Sentry = require('@sentry/node');
const { logger } = require('./utility');
const config = require('../config');

const url = config.SENTRY_URL;
module.exports = () => {
  if (url.length > 0) {
    logger.info('Initializing Sentry...');
    Sentry.init({ dsn: url });
  }
};
