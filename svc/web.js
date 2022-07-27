/**
 * Worker serving as main web application
 * Serves web/API requests
 * */
const cors = require('cors');
const compression = require('compression');
const express = require('express');
const requestIp = require('request-ip');
const moment = require('moment');
const api = require('../routes/api');
const redis = require('../store/redis');
const utility = require('../util/utility');
const config = require('../config');

const { logger, redisCount } = utility;

const app = express();
// const Sentry = require('../util/sentry')({ expressApp: app });

const whitelistedPaths = new Set([
  '/api', // Docs
  '/api/metadata', // Metadata
  '/api/skyblock/bazaar', // Bazaar
  '/api/skyblock/items',
  '/api/skyblock/auctions', // Auctions
]);

const pathCosts = {
  '/api/leaderboards': 5,
};

// Sentry middleware
// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());

app.disable('x-powered-by');
// Compression middleware
app.use(compression());
// Get client IP to use for rate limiting;
app.use(requestIp.mw());
// Health check
app.route('/healthz').get((_, response) => {
  response.send('ok');
});

// Rate limiter and API key middleware
app.use((request, response, callback) => {
  const apiKey = (request.headers.authorization && request.headers.authorization.replace('Bearer ', '')) || request.query.key;
  if (apiKey) {
    redis.get(`api_keys:${apiKey}`, (error, data) => {
      if (error) {
        callback(error);
      } else {
        if (data) {
          response.locals.key = JSON.parse(data);
          response.locals.isAPIRequest = 1;
        }
        callback();
      }
    });
  } else {
    callback();
  }
});
app.use((request, response, callback) => {
  const ip = request.clientIp;
  const agent = request.headers['user-agent'] || null;
  response.locals.ip = ip;

  response.locals.usageIdentifier = ip;
  let rateLimit = '';
  if (response.locals.isAPIRequest) {
    const { key } = response.locals;
    response.locals.usageIdentifier = key.key;
    rateLimit = key.limit;
    logger.info(`[KEY] ${key.app} visit ${request.originalUrl}, ip ${ip} via ${agent}`);
  } else {
    response.locals.usageIdentifier = ip;
    rateLimit = config.NO_API_KEY_PER_MIN_LIMIT;
    logger.info(`[USER] anonymous visit ${request.originalUrl}, ip ${ip} via ${agent}`);
  }

  const pathCost = pathCosts[request.path] || 1;
  const multi = redis.multi()
    .hincrby('rate_limit', response.locals.usageIdentifier, pathCost)
    .expireat('rate_limit', utility.getStartOfBlockMinutes(1, 1));

  if (!response.locals.isAPIRequest) {
    multi.zscore('user_usage_count', response.locals.usageIdentifier); // not API request so check previous usage.
  }

  multi.exec((error, data) => {
    if (error) {
      logger.error(error);
      return callback(error);
    }
    response.set({
      'X-Rate-Limit-Remaining-Minute': rateLimit - data[0][1],
      'X-IP-Address': ip,
    });
    if (!response.locals.isAPIRequest) {
      response.set('X-Rate-Limit-Remaining-Month', config.API_FREE_LIMIT - Number(data[2][1]));
    }
    logger.debug(`rate limit increment ${data}`);
    if (data[0][1] > rateLimit && config.NODE_ENV !== 'test') {
      return response.status(429).json({
        error: 'rate limit exceeded',
      });
    }
    if (!whitelistedPaths.has(request.path) && !response.locals.isAPIRequest && Number(data[2][1]) >= config.API_FREE_LIMIT) {
      return response.status(429).json({
        error: 'monthly api limit exceeded',
      });
    }
    return callback();
  });
});

// Telemetry middleware
app.use((request, response, callback) => {
  const timeStart = new Date();
  response.once('finish', () => {
    const timeEnd = new Date();
    const elapsed = timeEnd - timeStart;
    if (elapsed > 3000) {
      logger.debug(`[SLOWLOG] ${request.originalUrl}, ${elapsed}`);
    }

    // When called from a middleware, the mount point is not included in req.path. See Express docs.
    if (response.statusCode !== 500
      && response.statusCode !== 429
      && !whitelistedPaths.has(request.baseUrl + (request.path === '/' ? '' : request.path))
      && elapsed < 10000) {
      const multi = redis.multi();
      if (response.locals.isAPIRequest) {
        multi.hincrby('usage_count', response.locals.usageIdentifier, 1)
          .expireat('usage_count', utility.getEndOfMonth());
      } else {
        multi.zincrby('user_usage_count', 1, response.locals.usageIdentifier)
          .expireat('user_usage_count', utility.getEndOfMonth());
      }

      multi.exec((error, response) => {
        logger.debug(`usage count increment ${error} ${response}`);
      });
    }

    if (request.originalUrl.indexOf('/api') === 0) {
      redisCount(redis, 'api_hits');
      if (request.headers.origin === 'https://www.slothpixel.me') {
        redisCount(redis, 'api_hits_ui');
      }
      redis.zincrby('api_paths', 1, request.path.split('/')[1] || '');
      redis.expireat('api_paths', moment().startOf('hour').add(1, 'hour').format('X'));
    }
    redis.lpush('load_times', elapsed);
    redis.ltrim('load_times', 0, 9999);
  });
  callback();
});
/* app.use((request, response, next) => {
  // Reject request if not GET and Origin header is present and not an approved domain (prevent CSRF)
  if (request.method !== 'GET' && request.header('Origin') && request.header('Origin') !== config.UI_HOST) {
    return response.status(403).json({ error: 'Invalid Origin header' });
  }
  return next();
}); */
// CORS headers
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use('/api', api);

// app.use(Sentry.Handlers.errorHandler());

// 404 route
app.use((_, response) => {
  response.status(404).json({
    error: 'Not Found',
  });
});
// 500 route
app.use((error, _, response, callback) => {
  if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
    // default express handler
    return callback(error);
  }
  logger.error(error && error.stacktrace);
  return response.status(500).json({
    error: 'Internal Server Error',
  });
});
// temp fix
const port = config.PORT || config.FRONTEND_PORT;
const server = app.listen(port, () => {
  logger.info(`[WEB] listening on ${port}`);
});

/**
 * Wait for connections to end, then shut down
 * */
function gracefulShutdown() {
  logger.info('Received kill signal, shutting down gracefully.');
  server.close(() => {
    logger.info('Closed out remaining connections.');
    process.exit();
  });
  // if after
  setTimeout(() => {
    logger.info('Could not close connections in time, forcefully shutting down');
    process.exit();
  }, 10 * 1000);
}

// listen for TERM signal .e.g. kill
process.once('SIGTERM', gracefulShutdown);
// listen for INT signal e.g. Ctrl-C
process.once('SIGINT', gracefulShutdown);
module.exports = app;
