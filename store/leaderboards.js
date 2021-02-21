/* eslint-disable consistent-return */
/*
* Allows custom DB queries for leaderboards API endpoint
 */
const config = require('../config');
const { logger } = require('../util/utility');
const profileFields = require('./profileFields');
const templates = require('./lbTemplates');
const cacheFunctions = require('./cacheFunctions');

function cacheLeaderboard(lb, key, callback) {
  if (config.ENABLE_LEADERBOARD_CACHE) {
    cacheFunctions.write({
      key,
      duration: config.LEADERBOARD_CACHE_SECONDS,
    }, lb);
  }
  return callback(lb);
}

function getQueryFields(type, columns = '') {
  const defaultFields = (type === 'players')
    ? profileFields
    : [];
  return columns
    .split(',')
    .concat(defaultFields);
}

function createQuery({
  sortBy, sortOrder = 'desc', limit = 100, filter = '{}', significant = true, page = 0,
}) {
  let error;
  let filterObject = {};
  if (sortBy === undefined) {
    error = 'No sortBy parameter!';
  }
  try {
    filterObject = JSON.parse(filter);
  } catch (error_) {
    error = `Failed to parse filter JSON: ${error_.message}`;
  }
  // TODO - Later remove non ADMIN ranked admin accounts
  if (significant === true) {
    filterObject.rank = { $ne: 'ADMIN' };
  }
  filterObject[sortBy] = { $ne: null };
  if (limit > 1000) {
    limit = 1000;
  }
  sortOrder = (sortOrder === 'asc')
    ? 1
    : -1;
  return {
    filter: filterObject,
    options: {
      limit: Number(limit),
      skip: page * limit,
      sort: {
        [sortBy]: sortOrder,
      },
      maxTimeMS: 30000,
    },
    error,
  };
}

function transformData(data) {
  // Remove _id field from each entry
  return data.map((document) => {
    const object = document._doc;
    delete object._id;
    // Change extra columns from nested objects to keys
    if (Object.hasOwnProperty.call(object, 'stats')) {
      Object.keys(object.stats).forEach((game) => {
        const gameObject = object.stats[game];
        Object.keys(gameObject).forEach((stat) => {
          object[`${game}_${stat}`] = gameObject[stat];
        });
      });
      delete object.stats;
    }
    return object;
  });
}

function executeQuery(type, query, fields, callback) {
  let Model;
  if (type === 'guilds') {
    Model = 'Guild';
  } else {
    Model = 'Player';
  }
  const { filter, options, error } = createQuery(query);
  if (error) {
    return callback(error);
  }
  Model.find(filter, fields, options, (error_, result) => {
    if (error_) {
      logger.error(error_);
      return callback('Query failed');
    }
    callback(null, transformData(result));
  });
}

function getLeaderboards(query, template, callback) {
  if (template) {
    const [type, subtype] = template.split('_');
    if (templates[type].items[subtype] !== undefined) {
      const key = `leaderboard:${template}`;
      cacheFunctions.read({ key }, (lb) => {
        if (lb) {
          logger.debug(`Cache hit for ${key}`);
          return callback(null, lb);
        }
        const model = (type === 'general' || type === 'games')
          ? 'players'
          : 'guilds';
        const query = {
          sortBy: templates[type].items[subtype].sortBy,
          limit: 1000,
        };
        const fields = getQueryFields(model, templates[type].items[subtype].fields.join());
        executeQuery(model, query, fields, (error, data) => {
          if (error) {
            return callback(error);
          }
          cacheLeaderboard(data, key, (lb) => callback(null, lb));
        });
      });
    } else {
      callback('Invalid template name!');
    }
  } else {
    const { type } = query;
    if (type !== 'players' && type !== 'guilds') {
      return callback('No valid type parameter!');
    }
    const fields = getQueryFields(type, query.columns);
    executeQuery(type, query, fields, (error, lb) => {
      if (error) {
        return callback(error);
      }
      callback(null, lb);
    });
  }
}

module.exports = getLeaderboards;
