/* eslint-disable consistent-return */
/*
* Allows custom DB queries for leaderboards API endpoint
 */
const config = require('../config');
const redis = require('../store/redis');
const { profileFields } = require('../store/profileFields');
const {
  Player, Guild,
} = require('../store/models');

function cacheLeaderboard(lb, key, cb) {
  if (config.ENABLE_LEADERBOARD_CACHE) {
    redis.setex(key, config.LEADERBOARD_CACHE_SECONDS, JSON.stringify(lb), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
  return cb(lb);
}

function getQueryFields(columns = '') {
  let string = profileFields;
  columns
    .split(',')
    .forEach((item) => {
      string += ` ${item}`;
    });
  return string;
}

function createQuery({
  sortBy, limit = 10, filter = '{}', significant = true,
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
      sort: {
        [sortBy]: -1,
      },
      maxTimeMS: 30000,
    },
    error,
  };
}

function transformData(data) {
  const array = [];
  // Remove _id field from each entry
  data.forEach((doc) => {
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
    array.push(obj);
  });
  return array;
}

function getLeaderboards(query, cb) {
  const qs = JSON.stringify(query);
  const key = `leaderboard:${qs}`;
  redis.get(key, (err, reply) => {
    if (err) {
      return cb(err);
    } if (reply) {
      // console.log(`Cache hit for ${qs}`);
      const lb = JSON.parse(reply);
      return cb(null, lb);
    }
    let Model;
    const fields = getQueryFields(query.columns);
    if (query.type === 'players') {
      Model = Player;
    } else if (query.type === 'guilds') {
      Model = Guild;
    } else {
      cb('No valid type parameter!');
    }
    const { filter, options, error } = createQuery(query);
    if (error) {
      return cb(error);
    }
    Model.find(filter, fields, options, (err, res) => {
      if (err) {
        console.error(err);
        return cb('Query failed');
      }
      const data = transformData(res);
      cacheLeaderboard(data, key, lb => cb(null, lb));
    });
  });
}

module.exports = getLeaderboards;
