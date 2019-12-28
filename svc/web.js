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

const whitelistedPaths = [
  '/api', // Docs
  '/api/metadata', // Metadata
];

const pathCosts = {
  '/api/leaderboards': 5,
};

// Compression middleware
app.use(compression());
// Get client IP to use for rate limiting;
app.use(requestIp.mw());
// Health check
app.route('/healthz').get((req, res) => {
  res.send('ok');
});

// Rate limiter and API key middleware
app.use((req, res, cb) => {
  const ip = req.clientIp;
  res.locals.ip = ip;

  res.locals.usageIdentifier = ip;
  const rateLimit = config.NO_API_KEY_PER_MIN_LIMIT;
  logger.info(`[USER] ${req.user ? req.user.account_id : 'anonymous'} visit ${req.originalUrl}, ip ${ip}`);

  const pathCost = pathCosts[req.path] || Object.hasOwnProperty.call(req.query, 'cached') ? 0 : 1;
  const multi = redis.multi()
    .hincrby('rate_limit', res.locals.usageIdentifier, pathCost)
    .expireat('rate_limit', utility.getStartOfBlockMinutes(1, 1));

  if (!res.locals.isAPIRequest) {
    multi.zscore('user_usage_count', res.locals.usageIdentifier); // not API request so check previous usage.
  }

  multi.exec((err, resp) => {
    if (err) {
      logger.error(err);
      return cb(err);
    }
    res.set({
      'X-Rate-Limit-Remaining-Minute': rateLimit - resp[0],
    });
    if (!res.locals.isAPIRequest) {
      res.set('X-Rate-Limit-Remaining-Month', config.API_FREE_LIMIT - Number(resp[2]));
    }
    logger.debug(`rate limit increment ${resp}`);
    if (resp[0] > rateLimit && config.NODE_ENV !== 'test') {
      return res.status(429).json({
        error: 'rate limit exceeded',
      });
    }
    if (config.ENABLE_API_LIMIT && !whitelistedPaths.includes(req.path) && !res.locals.isAPIRequest && Number(resp[2]) >= config.API_FREE_LIMIT) {
      return res.status(429).json({
        error: 'monthly api limit exceeded',
      });
    }
    return cb();
  });
});

// Telemetry middleware
app.use((req, res, cb) => {
  const timeStart = new Date();
  res.once('finish', () => {
    const timeEnd = new Date();
    const elapsed = timeEnd - timeStart;
    if (elapsed > 3000) {
      logger.debug(`[SLOWLOG] ${req.originalUrl}, ${elapsed}`);
    }

    // When called from a middleware, the mount point is not included in req.path. See Express docs.
    if (res.statusCode !== 500
      && res.statusCode !== 429
      && !whitelistedPaths.includes(req.baseUrl + (req.path === '/' ? '' : req.path))
      && elapsed < 10000) {
      const multi = redis.multi();
      if (res.locals.isAPIRequest) {
        multi.hincrby('usage_count', res.locals.usageIdentifier, 1)
          .expireat('usage_count', utility.getEndOfMonth());
      } else {
        multi.zincrby('user_usage_count', 1, res.locals.usageIdentifier)
          .expireat('user_usage_count', utility.getEndOfMonth());
      }

      multi.exec((err, res) => {
        logger.debug(`usage count increment ${err} ${res}`);
      });
    }

    if (req.originalUrl.indexOf('/api') === 0) {
      redisCount(redis, 'api_hits');
      if (req.headers.origin === 'https://www.slothpixel.me') {
        redisCount(redis, 'api_hits_ui');
      }
      redis.zincrby('api_paths', 1, req.path.split('/')[1] || '');
      redis.expireat('api_paths', moment().startOf('hour').add(1, 'hour').format('X'));
    }
    redis.lpush('load_times', elapsed);
    redis.ltrim('load_times', 0, 9999);
  });
  cb();
});
app.use((req, res, next) => {
  // Reject request if not GET and Origin header is present and not an approved domain (prevent CSRF)
  if (req.method !== 'GET' && req.header('Origin') && req.header('Origin') !== config.UI_HOST) {
    return res.status(403).json({ error: 'Invalid Origin header' });
  }
  return next();
});
// CORS headers
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use('/api', api);

// 404 route
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
  });
});
// 500 route
app.use((err, req, res, cb) => {
  if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
    // default express handler
    return cb(err);
  }
  logger.error(err && err.stacktrace);
  return res.status(500).json({
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
