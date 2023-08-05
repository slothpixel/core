/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
const pify = require('pify');
const fs = require('fs');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const filterObject = require('filter-obj');
const { game_types: gameTypes } = require('hypixelconstants');
const { getAuctions } = require('../store/queryAuctions');
const { buildSkyblockCalendar, buildSkyblockEvents } = require('../store/buildSkyblockCalendar');
const redis = require('../store/redis');
const { getMetadata } = require('../store/queries');
const {
  logger,
} = require('../util/utility');

const getMetadataAsync = pify(getMetadata);

const gameStandardNames = gameTypes.map((game) => game.standard_name);

let schema = fs.readFileSync('./routes/spec.graphql', 'utf8');

// Dynamic schema generation
const schemaReplacements = {
  BOOSTER_QUERY: gameStandardNames.map((game) => `${game}: [GameBooster]`).join('\n'),
};

Object.entries(schemaReplacements).forEach(([phrase, replacer]) => {
  schema = schema.replace(`%${phrase}%`, replacer);
});

// Resolver classes

class SkyblockResolver {
  auctions(arguments_) {
    return getAuctions(arguments_);
  }

  async items() {
    const items = await redis.get('skyblock_items');
    return items ? JSON.parse(items) : {};
  }

  async bazaar({ item_id }) {
    const data = await redis.get('skyblock_bazaar');
    if (data === null) {
      logger.warn('No products found, is the bazaar service running?');
      throw new Error('No bazaar items available');
    }
    const bazaar = JSON.parse(data);
    if (item_id && !Array.isArray(item_id) && !item_id.includes(',') && !Object.keys(bazaar).includes(item_id)) {
      throw new Error('Invalid item_id');
    }
    if (!item_id) {
      return bazaar;
    }
    if (Array.isArray(item_id)) {
      return filterObject(bazaar, item_id);
    }
    if (item_id.includes(',')) {
      return filterObject(bazaar, item_id.split(','));
    }
    return bazaar[item_id];
  }

  events() {
    return buildSkyblockEvents();
  }

  calendar({
    events, from, to, years, stopatyearend,
  }) {
    return buildSkyblockCalendar(events, from, to, years, stopatyearend);
  }
}

const graphql = graphqlHTTP({
  schema: buildSchema(schema),
  graphiql: true,
  rootValue: {

    skyblock() {
      return new SkyblockResolver();
    },

    metadata() {
      return getMetadataAsync(null);
    },
  },
});

module.exports = graphql;
