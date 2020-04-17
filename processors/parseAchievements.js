const constants = require('hypixelconstants');
const { logger, DBToStandardName } = require('../util/utility');

const { achievements } = constants.achievements;

/*
* This function parses player achievements into an object containing all achievement related data.
 */
function parseAchievements({
  oneTime = [],
  tiered = {},
  tracked,
  rewards,
}) {
  const startTime = Date.now();
  function getAchievementProperties(a) {
    const split = a.split('_');
    const game = (split[0] === 'bridge'
      ? ['duels', 'bridge']
      : [split[0]]);
    split.shift();
    let name = split.join('_').toUpperCase();
    if (['duels', 'bridge'].includes(game)) name = `${game[1].toUpperCase()}_${name}`;
    return {
      game: game[0],
      name,
    };
  }
  function getStandardName(name = '') {
    switch (name) {
      case 'blitz':
        return 'Blitz';
      case 'copsandcrims':
        return 'CvC';
      case 'warlords':
        return 'Warlords';
      default:
        return DBToStandardName(name);
    }
  }
  // Initiate the achievements object
  const obj = {
    achievement_points: 0,
    completed_tiered: 0,
    completed_one_time: 0,
    completed_total: 0,
  };
  const gameObj = {};
  Object.keys(achievements).forEach((game) => {
    gameObj[game] = {
      one_time: [],
      tiered: {},
      completed: 0,
      completed_tiered: 0,
      completed_one_time: 0,
      points_total: 0,
      points_tiered: 0,
      points_one_time: 0,
    };
  });
  // Parse onetime achievements
  // Temp patch to onetime ach possibly containing an empty array
  oneTime.filter((elem) => typeof elem === 'string').forEach((achievement) => {
    const { game, name } = getAchievementProperties(achievement);
    if (Object.hasOwnProperty.call(achievements, game)) {
      const { points = 0 } = achievements[game].one_time[name] || 0;
      gameObj[game].points_one_time += points;
      gameObj[game].completed_one_time += 1;
      obj.completed_one_time += 1;
      gameObj[game].one_time.push(name);
    }
  });
  // Parse tiered achievements
  Object.entries(tiered).forEach((achievement) => {
    const { game, name } = getAchievementProperties(achievement[0]);
    if (Object.hasOwnProperty.call(achievements, game)) {
      const ach = achievements[game].tiered[name];
      if (ach !== undefined) {
        const tiers = ach.tiers.length;
        for (let t = 0; t < tiers; t += 1) {
          const required = ach.tiers[t].amount;
          if (achievement[1] >= required) {
            gameObj[game].points_tiered += ach.tiers[t].points;
            gameObj[game].completed_tiered += 1;
            obj.completed_tiered += 1;
          }
          if (achievement[1] < required || t === tiers - 1) {
            [, gameObj[game].tiered[name]] = achievement;
            break;
          }
        }
      } else {
        logger.debug(`Found non existing tiered achievement: ${JSON.stringify(achievement)}`);
      }
    }
  });
  // Finalise the object
  Object.keys(gameObj).forEach((game) => {
    const path = gameObj[game];
    path.completed = path.completed_tiered + path.completed_one_time;
    path.points_total = path.points_tiered + path.points_one_time;
    obj.achievement_points += path.points_total;
    const standardName = getStandardName(game);
    if (standardName !== game) {
      delete Object.assign(gameObj, { [standardName]: gameObj[game] })[game];
    }
  });
  obj.completed_total = obj.completed_one_time + obj.completed_tiered;
  obj.games = gameObj;
  obj.tracked = tracked;
  const rewardsObj = {};
  Object.keys(rewards).forEach((key) => {
    const value = key.split('_').pop();
    rewardsObj[value] = rewards[key];
  });
  obj.rewards = rewardsObj;
  logger.debug(`Achievement parsing took ${Date.now() - startTime}ms`);
  return (obj);
}

module.exports = parseAchievements;
