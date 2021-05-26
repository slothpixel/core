const constants = require('hypixelconstants');
const { logger, DBToStandardName } = require('../util/utility');

const { achievements } = constants.achievements;

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
  // Initiate the achievements object
  const object = {
    achievement_points: 0,
    legacy_achievement_points: 0,
    completed_tiered: 0,
    completed_one_time: 0,
    completed_total: 0,
  };
  const gameObject = {};
  Object.keys(achievements).forEach((game) => {
    gameObject[game] = {
      one_time: [],
      legacy: [],
      tiered: {},
      completed: 0,
      completed_tiered: 0,
      completed_one_time: 0,
      points_total: 0,
      points_tiered: 0,
      points_one_time: 0,
      points_legacy: 0,
    };
  });
  // Parse onetime achievements
  // Temp patch to onetime ach possibly containing an empty array
  oneTime.filter((element) => typeof element === 'string').forEach((achievement) => {
    const { game, name } = getAchievementProperties(achievement);
    if (Object.hasOwnProperty.call(achievements, game)) {
      const { points = 0 } = achievements[game].one_time[name] || 0;
      const { legacy = false } = achievements[game].one_time[name] || 0;
      gameObject[game].points_one_time += points;
      gameObject[game].completed_one_time += 1;
      object.completed_one_time += 1;
      gameObject[game].one_time.push(name);
      if (legacy === true) {
        gameObject[game].legacy.push(name);
        gameObject[game].points_legacy += points;
      }
    }
  });
  // Parse tiered achievements
  Object.entries(tiered).forEach((achievement) => {
    const { game, name } = getAchievementProperties(achievement[0]);
    if (Object.hasOwnProperty.call(achievements, game)) {
      const ach = achievements[game].tiered[name];
      if (ach !== undefined) {
        const { legacy = false } = ach;
        const achievementTiers = ach.tiers.length;
        for (let t = 0; t < achievementTiers; t += 1) {
          const required = ach.tiers[t].amount;
          if (achievement[1] >= required) {
            if (legacy === true) {
              gameObject[game].legacy.push(name);
              gameObject[game].points_legacy += ach.tiers[t].points;
            }
            gameObject[game].points_tiered += ach.tiers[t].points;
            gameObject[game].completed_tiered += 1;
            object.completed_tiered += 1;
          }
          if (achievement[1] < required || t === achievementTiers - 1) {
            if (achievement[1] >= required) {
              gameObject[game].tiered[name] = {
                current_tier: achievementTiers, current_amount: achievement[1], max_tier: achievementTiers, max_tier_amount: ach.tiers[achievementTiers - 1].amount,
              };
              break;
            }
            gameObject[game].tiered[name] = {
              current_tier: t, current_amount: achievement[1], max_tier: achievementTiers, max_tier_amount: ach.tiers[achievementTiers - 1].amount,
            };
            break;
          }
        }
      } else {
        logger.debug(`Found non existing tiered achievement: ${JSON.stringify(achievement)}`);
      }
    }
  });

  // Finalise the object
  Object.keys(gameObject).forEach((game) => {
    const path = gameObject[game];
    path.completed = path.completed_tiered + path.completed_one_time;
    path.points_total = path.points_tiered + path.points_one_time;
    object.achievement_points += path.points_total;
    // add up total legacy achievement points
    object.legacy_achievement_points += path.points_legacy;
    // Remove duplicate entries from legacy achievements
    path.legacy = [...new Set(path.legacy)];
    const standardName = getStandardName(game);
    if (standardName !== game) {
      delete Object.assign(gameObject, { [standardName]: gameObject[game] })[game];
    }
  });
  object.completed_total = object.completed_one_time + object.completed_tiered;
  object.games = gameObject;
  object.tracked = tracked;
  const rewardsObject = {};
  Object.keys(rewards).forEach((key) => {
    const value = key.split('_').pop();
    rewardsObject[value] = rewards[key];
  });
  object.rewards = rewardsObject;
  logger.debug(`Achievement parsing took ${Date.now() - startTime}ms`);
  return (object);
}

module.exports = parseAchievements;
