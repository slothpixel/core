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
  let xp = exp;
  do {
    xp -= EXP_NEEDED[level] || 3000000;
    level += 1;
  }
  while (xp > 0);
  level += ((EXP_NEEDED[level] || 3000000) - xp) / (EXP_NEEDED[level] || 3000000);
  return (level - 1).toFixed(2);
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
