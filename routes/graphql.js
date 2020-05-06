/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
const pify = require('pify');
const fs = require('fs');
const graphqlExpress = require('express-graphql');
const { buildSchema } = require('graphql');
const filterObject = require('filter-obj');
const { game_types: gameTypes } = require('hypixelconstants');
const { getPlayer, populatePlayers } = require('../store/buildPlayer');
const buildBazaar = require('../store/buildBazaar');
const buildBans = require('../store/buildBans');
const buildBoosters = require('../store/buildBoosters');
const { getAuctions, queryAuctionId } = require('../store/queryAuctions');
const { buildProfile } = require('../store/buildSkyBlockProfiles');
const { getGuildFromPlayer } = require('../store/buildGuild');
const leaderboards = require('../store/leaderboards');
const redis = require('../store/redis');
const getUUID = require('../store/getUUID');
const { getMetadata } = require('../store/queries');
const { generateJob, getData, typeToStandardName } = require('../util/utility');

const leaderboardsAsync = pify(leaderboards);
const redisGetAsync = pify(redis.get).bind(redis);
const getAuctionsAsync = pify(getAuctions);
const queryAuctionIdAsync = pify(queryAuctionId);
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
class BoostersResolver {
  constructor() {
    gameStandardNames.forEach((game) => {
      this[game] = async () => {
        const boosters = await buildBoosters();
        return boosters.boosters[game];
      };
    });
  }

  async all() {
    const { boosters } = await buildBoosters();
    return Object.entries(boosters).reduce((prev, [game, value]) => [...prev, { game, boosters: value }], []);
  }
}

class PlayersResolver {
  player({ player_name /* , fields */ }) {
    // TODO: Remove 'fields' param from the /players/{player_name} route.
    // If someone wants specific fields, they should use graphql.
    return getPlayer(player_name);
  }

  async achievements({ player_name }) {
    const player = await getPlayer(player_name);
    return player.achievements;
  }

  async quests({ player_name }) {
    const player = await getPlayer(player_name);
    return player.quests;
  }

  async recent_games({ player_name }) {
    const uuid = await getUUID(player_name);
    const data = await getData(redis, generateJob('recentgames', { id: uuid }).url);

    return data.games.map((game) => {
      game.gameType = typeToStandardName(game.gameType);
      return game;
    });
  }
}

class SkyblockResolver {
  all_auctions(args) {
    return getAuctionsAsync(args);
  }

  auctions({ from, to, item_id }) {
    return queryAuctionIdAsync(from, to, item_id);
  }

  async items() {
    const items = await redisGetAsync('skyblock_items');
    return items ? JSON.parse(items) : {};
  }

  async profiles({ player_name }) {
    const uuid = await getUUID(player_name);
    const profiles = await redisGetAsync(`skyblock_profiles:${uuid}`);
    return profiles ? JSON.parse(profiles) : {};
  }

  async profile({ player_name, profile_id }) {
    const uuid = await getUUID(player_name);
    const profile = await buildProfile(uuid, profile_id);
    const players = await populatePlayers(Object.keys(profile.members).map((uuid) => ({ uuid })));

    players.forEach((player) => {
      profile.members[player.profile.uuid].player = player.profile;
    });

    return profile;
  }

  async bazaar({ item_id }) {
    const resp = await redisGetAsync('skyblock_bazaar');
    const ids = JSON.parse(resp) || [];
    if (item_id && !Array.isArray(item_id) && !item_id.includes(',') && !ids.includes(item_id)) {
      throw new Error('Invalid item_id');
    }
    const products = await buildBazaar();
    if (!item_id) {
      return products;
    }
    if (Array.isArray(item_id)) {
      return filterObject(products, item_id);
    }
    if (item_id.includes(',')) {
      return filterObject(products, item_id.split(','));
    }
    return products[item_id];
  }
}

const graphql = graphqlExpress({
  schema: buildSchema(schema),
  rootValue: {
    bans() {
      return buildBans();
    },

    boosters() {
      return new BoostersResolver();
    },

    get_leaderboard_template({ template }) {
      return leaderboardsAsync(undefined, template);
    },

    guild({ player_name, populate_players }) {
      return getGuildFromPlayer(player_name, populate_players);
    },

    leaderboards(params) {
      return leaderboardsAsync(params, null);
    },

    players() {
      return new PlayersResolver();
    },

    skyblock() {
      return new SkyblockResolver();
    },

    metadata() {
      return getMetadataAsync(null);
    },
  },
});

module.exports = graphql;
