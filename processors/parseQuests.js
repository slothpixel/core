
/*
* Functions used to process quest and challenge data
 */
function parseQuests(quests, challenges) {
  const obj = {
    quests_completed: 0,
    challenges_completed: 0,
    completions: {},
  };
  Object.keys(quests).forEach((quest) => {
    obj.completions[quest] = [];
    if (Object.prototype.hasOwnProperty.call(quests[quest], 'completions')) {
      quests[quest].completions.forEach((completion) => {
        obj.completions[quest].push(completion.time);
        obj.quests_completed += 1;
      });
    }
  });
  const allTime = challenges.all_time || {};
  Object.keys(allTime).forEach((challenge) => {
    obj.challenges_completed += allTime[challenge];
  });
  return obj;
}

module.exports = parseQuests;
