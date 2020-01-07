/* eslint-disable consistent-return */
/*
* Allows custom DB queries for leaderboards API endpoint
 */
const config = require('../config');
const redis = require('../store/redis');
const { logger } = require('../util/utility');
const { profileFields } = require('../store/profileFields');
const templates = require('../store/lb-templates');
const {
  Player, Guild,
} = require('../store/models');

function cacheLeaderboard(lb, key, cb) {
  if (config.ENABLE_LEADERBOARD_CACHE) {
    redis.setex(key, config.LEADERBOARD_CACHE_SECONDS, JSON.stringify(lb), (err) => {
      if (err) {
        logger.error(err);
      }
    });
  }
  return cb(lb);
}

function getQueryFields(type, columns = '') {
  let string = (type === 'players')
    ? profileFields
    : '';
  columns
    .split(',')
    .forEach((item) => {
      string += ` ${item}`;
    });
  return string;
}

function createQuery({
  sortBy, limit = 10, filter = '{}', significant = true, page = 0,
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
  if (limit > 1000) {
    limit = 1000;
  }
  return {
    filter: filterObj,
    options: {
      limit: Number(limit),
      skip: page * limit,
      sort: {
        [sortBy]: -1,
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
      redis.get(key, (err, reply) => {
        if (err) {
          return cb(err);
        } if (reply) {
          logger.debug(`Cache hit for ${key}`);
          const lb = JSON.parse(reply);
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
          cacheLeaderboard(data, key, lb => cb(null, lb));
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
