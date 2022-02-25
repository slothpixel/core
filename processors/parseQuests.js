/*
* Functions used to process quest and challenge data
 */
function parseQuests(quests, challenges) {
  const object = {
    quests_completed: 0,
    challenges_completed: 0,
    completions: {},
  };
  Object.keys(quests).forEach((quest) => {
    object.completions[quest] = [];
    if (Object.prototype.hasOwnProperty.call(quests[quest], 'completions')) {
      quests[quest].completions.forEach((completion) => {
        object.completions[quest].push(completion.time);
        object.quests_completed += 1;
      });
    }
  });
  const allTime = challenges.all_time || {};
  Object.values(allTime).forEach((challenge) => {
    object.challenges_completed += challenge;
  });
  return object;
}

module.exports = parseQuests;
