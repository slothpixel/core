/* eslint-disable camelcase */
const { promisify } = require('util');
const fs = require('fs');
const graphqlExpress = require('express-graphql');
const { buildSchema } = require('graphql');
const { getPlayer } = require('../store/buildPlayer');
const buildBans = require('../store/buildBans');
const buildBoosters = require('../store/buildBoosters');
const { getGuildFromPlayer } = require('../store/buildGuild');
const leaderboards = require('../store/leaderboards');
const redis = require('../store/redis');
const getUUID = require('../store/getUUID');
const { generateJob, getData, typeToStandardName } = require('../util/utility');

const buildBansAsync = promisify(buildBans);
const buildBoostersAsync = promisify(buildBoosters);
const leaderboardsAsync = promisify(leaderboards);
const getGuildFromPlayerAsync = promisify(getGuildFromPlayer);
const getPlayerAsync = promisify(getPlayer);
const redisGetAsync = promisify(redis.get);


const graphql = graphqlExpress({
  schema: buildSchema(fs.readFileSync('./routes/spec.graphql', 'utf8')),
  rootValue: {
    bans() {
      return buildBansAsync();
    },

    all_boosters() {
      return buildBoostersAsync();
    },

    async boosters({ game }) {
      const data = await buildBoostersAsync();
      return data[game];
    },

    get_leaderboard_template({ template }) {
      return leaderboardsAsync(undefined, template);
    },

    guild({ player_name, populate_players }) {
      return getGuildFromPlayerAsync(player_name, populate_players);
    },

    leaderboards(params) {
      return leaderboardsAsync(params, null);
    },

    async player({ player_name /* , fields */ }) {
      // TODO: Remove 'fields' param from the /players/{player_name} route.
      // If someone wants specific fields, they should use graphql.
      return getPlayerAsync(player_name);
    },

    async playerAchievements({ player_name }) {
      const player = await getPlayerAsync(player_name);
      return player.achievements;
    },

    async playerQuests({ player_name }) {
      const player = await getPlayerAsync(player_name);
      return player.quests;
    },

    player_recent_games({ username }) {
      // TODO: Extract common code from here and spec.js
      return new Promise((resolve, reject) => {
        getUUID(username, (err, uuid) => {
          if (err) {
            return reject(err);
          }
          getData(redis, generateJob('recentgames', { id: uuid }).url, (err, data) => {
            if (err) {
              return reject(err);
            }
            try {
              return resolve(
                data.games.map((game) => {
                  game.gameType = typeToStandardName(game.gameType);
                  return game;
                }),
              );
            } catch (e) {
              return reject(e);
            }
          });

          return undefined;
        });
      });
    },

    skyblock_auction(/* { from, item_id, to } */) {
      // TODO
      return {};
    },

    skyblock_auctions(/* params */) {
      // TODO
      return {};
    },

    async skyblock_items() {
      return JSON.parse(await redisGetAsync('skyblock_items'));
    },

    skyblock_profiles(/* { player_name } */) {
      // TODO
      return {};
    },

    skyblock_profile(/* { player_name, profile_id } */) {
      // TODO
      return {};
    },

  },
});

module.exports = graphql;
