
function parseQuests(quests) {
  const obj = {
    quests_completed: 0,
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
  return obj;
}

module.exports = parseQuests;
