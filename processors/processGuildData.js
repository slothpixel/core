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

  // Increments by one from zero to the level cap
  for (let i = 0; i <= 100; i += 1) {
    // need is the required exp to get to the next level
    let need = 0;
    if (i >= EXP_NEEDED.length) {
      need = EXP_NEEDED[EXP_NEEDED.length - 1];
    } else { need = EXP_NEEDED[i]; }

    // If the required exp to get to the next level isn't met returns
    // the current level plus progress towards the next (unused exp/need)
    // Otherwise increments the level and substracts the used exp from exp var
    if ((exp - need) < 0) {
      return Math.round((level + (exp / need)) * 100) / 100;
    }
    level += 1;
    exp -= need;
  }

  // Returns the level cap - currently 100
  // If changed here, also change in for loop above
  return 100;
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
