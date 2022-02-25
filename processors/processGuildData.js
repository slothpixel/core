/* eslint-disable camelcase */
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
    2500000,
    2500000,
    3000000,
  ];

  let level = 0;

  // Increments by one from zero to the level cap
  for (let i = 0; i <= 1000; i += 1) {
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

  // Returns the level cap - currently 1000
  // If changed here, also change in for loop above
  return 1000;
}

function changeObjectKeys(object) {
  Object.keys(object).forEach((game) => {
    const standardName = utility.typeToStandardName(game);
    if (standardName !== game) {
      delete Object.assign(object, { [standardName]: object[game] })[game];
    }
  });
  return object;
}

/*
* This is stupid - See https://github.com/HypixelDev/PublicAPI/issues/177
 */
function insertDefaultRanks(ranks, created) {
  const highestPriority = Math.max(...ranks.map((o) => o.priority));
  ranks.push({
    name: 'Guild Master',
    default: false,
    tag: 'GM',
    created,
    priority: highestPriority + 1,
  });
  return ranks;
}

function getPreferredGames(games) {
  return games.map((game) => utility.typeToCleanName(game));
}

function processMember({
  uuid,
  rank,
  joined,
  questParticipation = 0,
  expHistory = [],
  mutedTill = null,
}) {
  return {
    uuid,
    rank: rank
      .replace('MEMBER', 'Member')
      .replace('OFFICER', 'Officer')
      .replace('GUILDMASTER', 'Guild Master'),
    joined,
    quest_participation: questParticipation,
    exp_history: expHistory,
    muted_till: mutedTill,
  };
}

function processMembers(members) {
  return members.map((member) => processMember(member));
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
  description = null,
  preferredGames = [],
  ranks = [],
  members = [],
  guildExpByGameType = {},
  achievements = {},
}) {
  const expHistory = {};
  const expByGame = changeObjectKeys(guildExpByGameType);
  const processedMembers = processMembers(members);
  Object.assign(expHistory, processedMembers[0].exp_history);
  processedMembers.forEach((member) => {
    Object.keys(member.exp_history).forEach((day) => {
      expHistory[day] += member.exp_history[day];
    });
  });
  const guildTag = utility.betterFormatting(tag);
  const tag_color = utility.colorNameToCode(tagColor);
  return {
    guild: true,
    name,
    id: _id,
    created,
    joinable,
    public: publiclyListed,
    tag: guildTag,
    tag_color,
    tag_formatted: guildTag ? `${tag_color}[${guildTag}]` : null,
    legacy_ranking: legacyRanking + 1,
    exp,
    level: getLevel(exp),
    exp_by_game: expByGame,
    exp_history: expHistory,
    guild_master: processedMembers.find((m) => m.rank === 'Guild Master'),
    description,
    preferred_games: getPreferredGames(preferredGames),
    ranks: insertDefaultRanks(ranks, created).sort((a, b) => b.priority - a.priority),
    members: processedMembers,
    achievements,
  };
}

module.exports = processGuildData;
