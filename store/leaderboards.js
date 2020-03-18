/* eslint-disable consistent-return */
/*
* Allows custom DB queries for leaderboards API endpoint
 */
const config = require('../config');
const { logger } = require('../util/utility');
const profileFields = require('./profileFields');
const templates = require('./lb-templates');
const cacheFunctions = require('./cacheFunctions');
const {
  Player, Guild,
} = require('./models');

function cacheLeaderboard(lb, key, cb) {
  if (config.ENABLE_LEADERBOARD_CACHE) {
    cacheFunctions.write({
      key,
      duration: config.ENABLE_LEADERBOARD_CACHE,
    }, lb);
  }
  return cb(lb);
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
  let filterObj = {};
  if (sortBy === undefined) {
    error = 'No sortBy parameter!';
  }
  try {
    filterObj = JSON.parse(filter);
  } catch (e) {
    error = `Failed to parse filter JSON: ${e.message}`;
  }
  // TODO - Later remove non ADMIN ranked admin accounts
  if (significant === true) {
    filterObj.rank = { $ne: 'ADMIN' };
  }
  filterObj[sortBy] = { $ne: null };
  if (limit > 1000) {
    limit = 1000;
  }
  sortOrder = (sortOrder === 'asc')
    ? 1
    : -1;
  return {
    filter: filterObj,
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
  return data.map((doc) => {
    const obj = doc._doc;
    delete obj._id;
    // Change extra columns from nested objects to keys
    if (Object.hasOwnProperty.call(obj, 'stats')) {
      Object.keys(obj.stats).forEach((game) => {
        const gameObj = obj.stats[game];
        Object.keys(gameObj).forEach((stat) => {
          obj[`${game}_${stat}`] = gameObj[stat];
        });
      });
      delete obj.stats;
    }
    return obj;
  });
}

function executeQuery(type, query, fields, cb) {
  let Model;
  if (type === 'guilds') {
    Model = Guild;
  } else {
    Model = Player;
  }
  const { filter, options, error } = createQuery(query);
  if (error) {
    return cb(error);
  }
  Model.find(filter, fields, options, (err, res) => {
    if (err) {
      logger.error(err);
      return cb('Query failed');
    }
    cb(null, transformData(res));
  });
}

function getLeaderboards(query, template, cb) {
  if (template) {
    const [type, subtype] = template.split('_');
    if (templates[type].items[subtype] !== undefined) {
      const key = `leaderboard:${template}`;
      cacheFunctions.read({ key }, (lb) => {
        if (lb) {
          logger.debug(`Cache hit for ${key}`);
          return cb(null, lb);
        }
        const model = (type === 'general' || type === 'games')
          ? 'players'
          : 'guilds';
        const query = {
          sortBy: templates[type].items[subtype].sortBy,
          limit: 1000,
        };
        const fields = getQueryFields(model, templates[type].items[subtype].fields.join());
        executeQuery(model, query, fields, (err, data) => {
          if (err) {
            return cb(err);
          }
          cacheLeaderboard(data, key, (lb) => cb(null, lb));
        });
      });
    } else {
      cb('Invalid template name!');
    }
  } else {
    const { type } = query;
    if (type !== 'players' && type !== 'guilds') {
      return cb('No valid type parameter!');
    }
    const fields = getQueryFields(type, query.columns);
    executeQuery(type, query, fields, (err, lb) => {
      if (err) {
        return cb(err);
      }
      cb(null, lb);
    });
  }
}

module.exports = getLeaderboards;
