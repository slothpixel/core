/**
 * Worker serving as main web application
 * Serves web/API requests
 * */
const config = require('../config');

const api = require('../routes/api');
const compression = require('compression');
const express = require('express');
const cors = require('cors');

const app = express();

// Compression middleware
app.use(compression());
// Health check
app.route('/healthz').get((req, res) => {
  res.send('ok');
});

// Rate limiter and API key middleware

// Telemetry middleware

// CORS headers
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use('/api', api);

// 404 route
app.use((req, res) =>
  res.status(404).json({
    error: 'Not Found',
  }));
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
 * Wait for connections to end, then shut down
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
