/**
 * Worker serving as main web application
 * Serves web/API requests
 * */
const cors = require('cors');
const compression = require('compression');
const express = require('express');
const moment = require('moment');
const api = require('../routes/api');
const redis = require('../store/redis');
const utility = require('../util/utility');
const config = require('../config');

const { redisCount } = utility;

const app = express();

// Compression middleware
app.use(compression());
// Health check
app.route('/healthz').get((req, res) => {
  res.send('ok');
});

// Rate limiter and API key middleware
app.use((req, res, cb) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  [ip] = ip.replace(/^.*:/, '').split(',');

  res.locals.ip = ip;

  res.locals.usageIdentifier = ip;
  const rateLimit = config.NO_API_KEY_PER_MIN_LIMIT;
  console.log('[USER] %s visit %s, ip %s', req.user ? req.user.account_id : 'anonymous', req.originalUrl, ip);

  const pathCost = Object.hasOwnProperty.call(req.query, 'cached') ? 0 : 1;
  const multi = redis.multi()
    .hincrby('rate_limit', res.locals.usageIdentifier, pathCost)
    .expireat('rate_limit', utility.getStartOfBlockMinutes(1, 1));

  multi.exec((err, resp) => {
    if (err) {
      console.log(err);
      return cb(err);
    }

    res.set({
      'X-Rate-Limit-Remaining-Minute': rateLimit - resp[0],
    });
    if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
      console.log('rate limit increment', resp);
    }
    if (resp[0] > rateLimit && config.NODE_ENV !== 'test') {
      return res.status(429).json({
        error: 'rate limit exceeded',
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
    if (elapsed > 1000 || config.NODE_ENV === 'development') {
      console.log('[SLOWLOG] %s, %s', req.originalUrl, elapsed);
    }

    // When called from a middleware, the mount point is not included in req.path. See Express docs.
    if (res.statusCode !== 500
      && res.statusCode !== 429
      && elapsed < 10000) {
      const multi = redis.multi();
      multi.hincrby('usage_count', res.locals.usageIdentifier, 1)
        .expireat('usage_count', utility.getEndOfMonth());

      multi.exec((err, res) => {
        if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
          console.log('usage count increment', err, res);
        }
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
  return res.status(500).json({
    error: 'Internal Server Error',
  });
});
// temp fix
const port = config.PORT || config.FRONTEND_PORT;
const server = app.listen(Number(port), () => {
  console.log('[WEB] listening on %s', port);
});

/**
 * * Wait for connections to end, then shut down
 * */
function gracefulShutdown() {
  console.log('Received kill signal, shutting down gracefully.');
  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit();
  });
  // if after
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit();
  }, 10 * 1000);
}

// listen for TERM signal .e.g. kill
process.once('SIGTERM', gracefulShutdown);
// listen for INT signal e.g. Ctrl-C
process.once('SIGINT', gracefulShutdown);
module.exports = app;
