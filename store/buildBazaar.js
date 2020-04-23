/* eslint-disable consistent-return */
const redis = require('./redis');
const cacheFunctions = require('./cacheFunctions');
const { getData, generateJob } = require('../util/utility');

function buildBazaar(cb) {
  const key = 'bazaar';
  cacheFunctions.read({ key }, (cache) => {
    if (cache) {
      return cb(null, cache);
    }
    getData(redis, generateJob('bazaar_products').url).then(({ products }) => {
      cacheFunctions.write({
        key,
        duration: 60,
      }, products, () => { });
      return cb(null, products);
    }).catch((error) => {
      cb(error.message);
    });
  });
}

module.exports = buildBazaar;
