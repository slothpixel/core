/* eslint-disable global-require,import/no-dynamic-require */
/**
 * Entry point for the application.
 * */
const pm2 = require('pm2');
const async = require('async');
const { apps } = require('./manifest.json');

const arguments_ = process.argv.slice(2);
const group = arguments_[0] || process.env.GROUP;

if (process.env.ROLE) {
  // if role variable is set just run that script
  require(`./svc/${process.env.ROLE}.js`);
} else if (group) {
  pm2.connect(() => {
    async.each(apps, (app, callback) => {
      if (group === app.group) {
        console.log(app.script, app.instances);
        pm2.start(app.script, {
          instances: app.instances,
          max_memory_restart: '2GB',
          restartDelay: 10000,
        }, (error) => {
          if (error) {
            // Log the error and continue
            console.error(error);
          }
          callback();
        });
      }
    }, (error) => {
      if (error) {
        console.error(error);
      }
      pm2.disconnect();
    });
  });
  // Clean up the logs once an hour
  setInterval(() => pm2.flush(), 3600 * 1000);
} else {
  // Block indefinitely (keep process alive for Docker)
  process.stdin.resume();
}
