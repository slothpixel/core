/**
 * Interface to PostgreSQL client
 * */
const { createPool } = require('slonik');
const config = require('../config');

const pool = createPool(config.POSTGRES_URL);

module.exports = pool;
