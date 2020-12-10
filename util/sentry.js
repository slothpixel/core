const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const { logger } = require('./utility');
const config = require('../config');

const url = config.SENTRY_URL;
module.exports = ({ expressApp }) => {
  if (url.length > 0) {
    logger.info('Initializing Sentry...');
    const integrations = expressApp
      ? [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app: expressApp }),
      ] : [];
    Sentry.init({
      dsn: url,
      tracesSampleRate: 1,
      integrations,
    });
  }
  return Sentry;
};
