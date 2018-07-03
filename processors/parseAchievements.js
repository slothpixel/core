const constants = require('hypixelconstants');

const { achievements } = constants.achievements;

/*
* This function parses player achievements into an object containing all achievement related data.
* TODO: Change response object names to standard names (Tricky since naming is not following rules)
 */
function parseAchievements(oneTime, tiered) {
  function getAchievementProperties(a) {
    const split = a.split('_');
    const game = split[0];
    split.shift();
    const name = split.join('_').toUpperCase();
    return {
      game,
      name,
    };
  }
  // Initiate the achievements object
  const obj = {};
  Object.keys(achievements).forEach((game) => {
    obj[game] = {
      one_time: [],
      tiered: [],
      completed: 0,
      completed_tiered: 0,
      completed_one_time: 0,
      points_total: 0,
      points_tiered: 0,
      points_one_time: 0,
    };
  });
  // Parse onetime achievements
  oneTime.forEach((achievement) => {
    const { game, name } = getAchievementProperties(achievement);
    const { points } = achievements[game].one_time[name];
    obj[game].points_one_time += points;
    obj[game].completed_one_time += 1;
    obj[game].one_time.push(name);
  });
  // Parse tiered achievements
  Object.entries(tiered).forEach((achievement) => {
    const { game, name } = getAchievementProperties(achievement[0]);
    const ach = achievements[game].tiered[name];
    for (let t = 0; t < ach.tiers.length; t += 1) {
      if (achievement[1] >= ach.tiers[t].amount) {
        obj[game].points_tiered += ach.tiers[t].points;
        obj[game].completed_tiered += 1;
      } else {
        [, obj[game].tiered[name]] = achievement;
        break;
      }
    }
  });
  // Finalise the object
  let achievementPoints = 0;
  Object.keys(obj).forEach((game) => {
    const path = obj[game];
    path.completed = path.completed_tiered + path.completed_one_time;
    path.points_total = path.points_tiered + path.points_one_time;
    achievementPoints += path.points_total;
  });
  obj.achievement_points = achievementPoints;
  return (obj);
}

/*
const oneTime = ['vampirez_purchase_sword', 'vampirez_sole_survivor', 'tntgames_wizards_first_win',
  'halloween2017_tbr_observatory_spin'];
const tiered = {
  tntgames_wizards_wins: 130,
  halloween2017_pumpkinator: 1020,
  buildbattle_build_battle_score: 1980,
  buildbattle_guess_the_build_guesses: 547,
};
(function test() {
  console.log((parseAchievements(oneTime, tiered)));
}());
*/

module.exports = parseAchievements;
