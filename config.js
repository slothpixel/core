/**
 * File managing configuration for the application
 * */
const dotenv = require('dotenv');
const fs = require('fs');

if (fs.existsSync('.env')) {
  dotenv.config();
}

const defaults = {
  HYPIXEL_API_KEY: '', // To get your API key, type '/api' on Hypixel
  HYPIXEL_API_LIMIT: 120, // API key throttle limit
  ROLE: '', // for specifying the file that should be run when entry point is invoked
  GROUP: '', // for specifying the group of apps that should be run when entry point is invoked
  NODE_ENV: 'development',
  FRONTEND_PORT: 5000,
  ITEMS_PORT: 5100,
  MOJANG_STATUS_INTERVAL: 15000, // Interval between refreshing Mojang status in milliseconds
  ITEMS_HOST: 'http://localhost:5100', // host of the items server
  REDIS_URL: 'redis://127.0.0.1:6379/0', // connection string for Redis
  SENTRY_URL: '',
  ITEMS_PERCENT: 1, // probability of submitting skyblock inventories to item service
  API_FREE_LIMIT: 50000, // number of api requests per month before 429 is returned.
  NO_API_KEY_PER_MIN_LIMIT: 60, // Rate limit per minute if not using an API key
  DEFAULT_DELAY: 1000, // delay between API requests
  ENABLE_UUID_CACHE: true, // cache player stats
  ENABLE_PLAYER_CACHE: true, // cache players
  ENABLE_GUILD_CACHE: true, // cache guilds
  ENABLE_BANS_CACHE: true, // cache bans
  ENABLE_BOOSTERS_CACHE: true, // cache boosters
  ENABLE_COUNTS_STASH: true, // cache counts
  ENABLE_SESSION_CACHE: true, // cache session
  ENABLE_LEADERBOARD_CACHE: true, // cache leaderboards
  ENABLE_AUCTION_CACHE: true, // cache auctions
  ENABLE_DB_CACHE: true, // set to enable MongoDB cache
  UUID_CACHE_SECONDS: 21600, // number of seconds to cache username-uuid pairs
  PLAYER_CACHE_SECONDS: 600, // number of seconds to cache players
  GUILD_CACHE_SECONDS: 600, // number of seconds to cache guilds
  BANS_CACHE_SECONDS: 30, // number of seconds to cache bans
  BOOSTERS_CACHE_SECONDS: 30, // number of seconds to cache boosters
  COUNTS_CACHE_SECONDS: 60, // number of seconds to cache counts
  SESSION_CACHE_SECONDS: 60, // number of seconds to cache session
  LEADERBOARD_CACHE_SECONDS: 900, // number of seconds to cache each leaderboard
  AUCTION_CACHE_SECONDS: 60,
};

// ensure that process.env has all values in defaults, but prefer the process.env value
Object.keys(defaults).forEach((key) => {
  process.env[key] = (key in process.env) ? process.env[key] : defaults[key];
});
if (process.env.NODE_ENV === 'development') {
  // force PORT to null in development so we can run multiple web services without conflict
  // process.env.PORT = '';
}
if (process.env.NODE_ENV === 'test') {
  process.env.PORT = ''; // use service default
  process.env.DEFAULT_DELAY = 0;
  // process.env.REDIS_URL = process.env.REDIS_TEST_URL;
  process.env.SESSION_SECRET = 'testsecretvalue';
  process.env.FRONTEND_PORT = 5001;
}
// now processes can use either process.env or config
module.exports = process.env;
