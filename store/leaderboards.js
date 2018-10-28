/*
* Allows custom DB queries for leaderboards API endpoint
 */
const { profileFields } = require('../store/profileFields');
const {
  Player, Guild,
} = require('../store/models');

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
  const filterObj = JSON.parse(filter) || {};
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
    },
  };
}

function transformData(data) {
  const array = [];
  // Remove _id field from each entry
  data.forEach((obj) => {
    delete obj._doc._id;
    array.push(obj);
  });
  return array;
}

function doStuff(query, cb) {
  let Model;
  const fields = getQueryFields(query.columns);
  console.log(fields);
  if (query.type === 'players') {
    Model = Player;
  } else if (query.type === 'guilds') {
    Model = Guild;
  } else {
    cb('No type parameter!');
  }
  const { filter, options } = createQuery(query);
  Model.find(filter, fields, options, (err, res) => {
    if (err) {
      console.error(err);
      return cb(err);
    }
    return cb(null, transformData(res));
  });
}

module.exports = doStuff;
