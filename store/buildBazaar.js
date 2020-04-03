/* eslint-disable consistent-return */
const redis = require('./redis');
const cacheFunctions = require('./cacheFunctions');
const { getData, generateJob } = require('../util/utility');

function prettify({ product_info = {} }) {
  delete product_info.product_id;
  delete product_info.quick_status.productId;
  product_info.week_historic.map((item) => {
    delete item.productId;
    return item;
  });
  // eslint-disable-next-line camelcase
  return product_info;
}

function buildBazaar(id, cb) {
  const key = `bazaar:${id}`;
  cacheFunctions.read({ key }, (cache) => {
    if (cache) {
      return cb(null, cache);
    }
    getData(redis, generateJob('bazaar_product', { id }).url, (err, data) => {
      if (err) {
        return cb(err);
      }
      const bazaar = prettify(data);
      cacheFunctions.write({
        key,
        duration: 60,
      }, bazaar, () => {});
      return cb(null, bazaar);
    });
  });
}

module.exports = buildBazaar;
