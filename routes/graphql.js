/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
const pify = require('pify');
const fs = require('fs');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const filterObject = require('filter-obj');
const { game_types: gameTypes } = require('hypixelconstants');
const { getPlayer, populatePlayers } = require('../store/buildPlayer');
const buildBans = require('../store/buildBans');
const buildBoosters = require('../store/buildBoosters');
const buildCounts = require('../store/buildCounts');
const buildPlayerStatus = require('../store/buildPlayerStatus');
const { getAuctions } = require('../store/queryAuctions');
const { buildProfileList, buildProfile } = require('../store/buildSkyBlockProfiles');
const { buildSkyblockCalendar, buildSkyblockEvents } = require('../store/buildSkyblockCalendar');
const buildGuild = require('../store/buildGuild');
const leaderboards = require('../store/leaderboards');
const redis = require('../store/redis');
const getUUID = require('../store/getUUID');
const { getMetadata } = require('../store/queries');
const {
  logger, generateJob, getData, typeToCleanName,
} = require('../util/utility');

const leaderboardsAsync = pify(leaderboards);
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
    return Object.entries(boosters).map(([game, boosters]) => ({ game, boosters }));
  }
}

class PlayersResolver {
  player({ player_name }) {
    return getPlayer(player_name);
  }

  async achievements({ player_name }) {
    const { achievements } = await getPlayer(player_name);
    achievements.games = Object.keys(achievements.games).map((key) => ({ name: key, ...achievements.games[key] }));
    return achievements;
  }

  async quests({ player_name }) {
    const player = await getPlayer(player_name);
    return player.quests;
  }

  async recent_games({ player_name }) {
    const uuid = await getUUID(player_name);
    const data = await getData(redis, generateJob('recentgames', { id: uuid }).url);

    return data.games.map((game) => {
      game.gameType = typeToCleanName(game.gameType);
      return game;
    });
  }

  async profile({ player_name }) {
    const uuid = await getUUID(player_name);
    const [{ profile }] = await populatePlayers([{ uuid }]);
    return profile;
  }

  async status({ player_name }) {
    return buildPlayerStatus(player_name);
  }
}

class SkyblockResolver {
  auctions(arguments_) {
    return getAuctions(arguments_);
  }

  async items() {
    const items = await redis.get('skyblock_items');
    return items ? JSON.parse(items) : {};
  }

  async profiles({ player_name }) {
    const uuid = await getUUID(player_name);
    const profiles = await redis.get(`skyblock_profiles:${uuid}`);
    return profiles ? JSON.parse(profiles) : buildProfileList(uuid);
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
    bans() {
      return buildBans();
    },

    boosters() {
      return new BoostersResolver();
    },

    counts() {
      return buildCounts();
    },

    get_leaderboard_template({ template }) {
      return leaderboardsAsync(undefined, template);
    },

    async guild({ player_name, populate_players }) {
      const id = await getUUID(player_name).catch(() => null);
      if (!id) throw new Error('Player not found');

      return buildGuild('player', id, { shouldPopulatePlayers: populate_players });
    },

    guild_by_name({ guild_name, populate_players }) {
      return buildGuild('name', guild_name, populate_players);
    },

    leaderboards(parameters) {
      return leaderboardsAsync(parameters, null);
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
