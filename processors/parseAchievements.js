/* eslint-disable no-loop-func */
/*
* This file require major refactoring
 */
const constants = require('hypixelconstants');

module.exports = function parseAchievements(oneTime, tiered) {
  const { achievements } = constants.achievements;

  const res = {};
  let totalOnetime = 0; // Achievement points from one time achievements
  let totalTiered = 0; // Achievement points from tiered achievements

  let completedOnetime = 0; // Total one time achievements completed
  let completedTiered = 0; // Total tiered achievements completed

  const gameArray = Object.getOwnPropertyNames(achievements); // Array containing all minigames
  for (let i = 0; i < gameArray.length; i += 1) { // Loop through each minigame
    // Array containing all achievement names for minigame i
    const oneTimeAchArray = Object.getOwnPropertyNames(achievements[gameArray[i]].oneTime);
    // This loop gets all one-time achievements
    for (let j = 0; j < oneTimeAchArray.length; j += 1) {
      for (let k = 0; k < oneTime.length; k += 1) {
        if (oneTime[k] === (`${gameArray[i]}_${oneTimeAchArray[j]}`).toLowerCase()) {
          totalOnetime += achievements[gameArray[i]].oneTime[oneTimeAchArray[j]].points;
          completedOnetime += 1;
        }
      }
    }

    const tieredAchievementArray = Object.getOwnPropertyNames(achievements[gameArray[i]].tiered);
    for (let j = 0; j < tieredAchievementArray.length; j += 1) {
      Object.keys(tiered).forEach((key) => {
        if (key === (`${gameArray[i]}_${tieredAchievementArray[j]}`).toLowerCase()) {
          const achievement = achievements[gameArray[i]].tiered[tieredAchievementArray[j]];
          for (let t = 0; t < achievement.tiers.length; t += 1) {
            if (tiered[key] >= achievement.tiers[[t]].amount) {
              totalTiered += achievement.tiers[[t]].points;
              completedTiered += 1;
            }
          }
        }
      });
    }
  }
  res.points_oneTime = totalOnetime;
  res.points_oneTime = totalOnetime;
  res.points_tiered = totalTiered;
  res.points_total = totalOnetime + totalTiered;
  res.completedOnetime = completedOnetime;
  res.completedTiered = completedTiered;
  return (res);
};
