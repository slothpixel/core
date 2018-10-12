const utility = require('../util/utility');

/*
 * Returns guild level with 2 decimal places
 */
function getLevel(exp) {
  const EXP_NEEDED = [
    100000,
    150000,
    250000,
    500000,
    750000,
    1000000,
    1250000,
    1500000,
    2000000,
    2500000,
    2500000,
    2500000,
    3000000,
  ];

  let level = 0;

  // Returns two decimal places if level is less than 1 (ex. 50000 = 0.5)
  // or returns levels between the top of EXP_NEED and the level cap of 100
  if (exp < EXP_NEEDED[0]) { return Math.round((exp / EXP_NEEDED[0]) * 100) / 100; }   
  if (exp >= EXP_NEEDED[(EXP_NEEDED.length - 1)]) {
    level = EXP_NEEDED.length;
    const expRemainder = exp - EXP_NEEDED[(EXP_NEEDED.length - 1)];
    level += expRemainder / EXP_NEEDED[(EXP_NEEDED.length - 1)];
    if (level >= 100) { return 100; } 
    return Math.round(level * 100) / 100;
  }

  // Otherwise increments through the exp_needed array until current element is
  // greater than experience obtained, returns the current level plus a percent
  // of the next level experience already gained (as decimal places)
  for (let i = 0; i <= (EXP_NEEDED.length - 1); i += 1) {
    if (exp >= EXP_NEEDED[i]) {
      level += 1;
    } else {
      const currentLevelGrowthExp = EXP_NEEDED[i] - EXP_NEEDED[i - 1];
      const currentLevelCompletion = (exp - EXP_NEEDED[i - 1]) / currentLevelGrowthExp;
      return Math.round((level + currentLevelCompletion) * 100) / 100;
    }
  }

  // This should never happen
  return -1;
}

function processGuildData({
  name,
  _id,
  created,
  joinable = false,
  publiclyListed = false,
  tag = null,
  tagColor = 'GRAY',
  legacyRanking,
  exp = 0,
  discord = null,
  description = null,
  preferredGames = [],
  ranks = [],
  members = [],
}) {
  return {
    name,
    id: _id,
    created,
    joinable,
    public: publiclyListed,
    tag: utility.betterFormatting(tag),
    tag_color: utility.colorNameToCode(tagColor),
    legacy_ranking: legacyRanking + 1,
    exp,
    level: getLevel(exp),
    discord,
    description,
    preferred_games: preferredGames,
    ranks,
    members,
  };
}

module.exports = processGuildData;
