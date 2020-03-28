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

    allBoosters() {
      return buildBoostersAsync();
    },

    async boosters({ game }) {
      const data = await buildBoostersAsync();
      return data[game];
    },

    getLeaderboardTemplate({ template }) {
      return leaderboardsAsync(undefined, template);
    },

    guild({ playerName, populatePlayers }) {
      return getGuildFromPlayerAsync(playerName, populatePlayers);
    },

    leaderboards(params) {
      return leaderboardsAsync(params, null);
    },

    player({ playerName /* , fields */ }) {
      // TODO: Remove 'fields' param from the /players/{playerName} route.
      // If someone wants specific fields, they should use graphql.
      return getPlayerAsync(playerName);
    },

    async playerAchievements({ playerName }) {
      const player = await getPlayerAsync(playerName);
      return player.achievements;
    },

    async playerQuests({ playerName }) {
      const player = await getPlayerAsync(playerName);
      return player.quests;
    },

    playerRecentGames({ username }) {
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

    skyblockAuction(/* { from, itemId, to } */) {
      // TODO
      return {};
    },

    skyblockAuctions(/* params */) {
      // TODO
      return {};
    },

    async skyblockItems() {
      return JSON.parse(await redisGetAsync('skyblock_items'));
    },

    skyblockProfiles(/* { playerName } */) {
      // TODO
      return {};
    },

    skyblockProfile(/* { playerName, profileId } */) {
      // TODO
      return {};
    },

  },
});

module.exports = graphql;
