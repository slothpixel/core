/**
 * Interface to PostgreSQL client
 * */
const pg = require('pg');
const knex = require('knex');
const { logger } = require('../util/utility');
const config = require('../config');

// remember: all values returned from the server are either NULL or a string
pg.types.setTypeParser(20, (value) => (value === null ? null : Number.parseInt(value, 10)));
logger.info(`connecting ${config.POSTGRES_URL}`);
const database = knex({
  client: 'pg',
  connection: config.POSTGRES_URL,
});
database.on('query-error', (error) => {
  logger.error(error);
});
module.exports = database;
