const {
  logger,
  DBToStandardName,
  generateFormattedRank,
  colorNameToCode,
  betterFormatting,
  typeToCleanName,
  isContributor,
} = require('../util/utility');
const calculateLevel = require('../util/calculateLevel');

const processStats = require('./games');
const parseAchievements = require('./parseAchievements');
const parseQuests = require('./parseQuests');

function getPlayerRank(rank, packageRank, newPackageRank, monthlyPackageRank) {
  let playerRank;
  if (monthlyPackageRank === 'NONE') monthlyPackageRank = null;
  if (rank === 'NORMAL') {
    playerRank = monthlyPackageRank || newPackageRank || packageRank || null;
  } else {
    playerRank = rank || monthlyPackageRank || newPackageRank || packageRank || null;
  }

  if (playerRank === 'SUPERSTAR') {
    playerRank = 'MVP_PLUS_PLUS';
  }

  if (playerRank === 'NONE') {
    playerRank = null;
  }
  return playerRank;
}

function getFirstLogin(firstLogin, _id) {
  // Get date from MongoDB ObjectId
  const betterDate = Number.parseInt(_id.slice(0, 8), 16) * 1000;
  return (betterDate < firstLogin)
    ? betterDate
    : firstLogin;
}

function getOnlineStatus(lastLogin, lastLogout) {
  return (lastLogin === null || lastLogout === null)
    ? false
    : lastLogin > lastLogout;
}

/*
 * This function modifies the raw API response to the wanted format
 */
function processPlayerData({
  _id,
  uuid,
  achievements,
  achievementsOneTime,
  achievementRewardsNew = {},
  achievementTracking = [],
  quests = {},
  challenges = {},
  displayname = null,
  firstLogin,
  lastLogin = null,
  lastLogout = null,
  rank = null,
  packageRank = null,
  newPackageRank = null,
  prefix = null,
  monthlyPackageRank = null,
  rankPlusColor = 'RED',
  monthlyRankColor = 'GOLD',
  karma = 0,
  networkExp = 0,
  achievementPoints = 0,
  mcVersionRp = null,
  mostRecentGameType = null,
  userLanguage = 'ENGLISH',
  giftingMeta: { realBundlesGiven = 0, realBundlesReceived = 0, ranksGiven = 0 } = {},
  rewardScore = 0,
  rewardHighScore = 0,
  totalRewards = 0,
  totalDailyRewards = 0,
  adsense_tokens = 0,
  voting: { total = 0, last_vote = null, votesToday = 0 } = {},
  socialMedia: { links = {} } = {},
  stats = {},
}) {
  let achievements_;
  try {
    achievements_ = parseAchievements({
      oneTime: achievementsOneTime, tiered: achievements, tracked: achievementTracking, rewards: achievementRewardsNew,
    });
  } catch (error) {
    logger.error(`Failed parsing achievements: ${error}`);
  }

  let quests_;

  try {
    quests_ = parseQuests(quests, challenges);
  } catch (error) {
    logger.error(`Failed parsing quests: ${error}`);
  }

  const defaultLinks = {
    TWITTER: null,
    YOUTUBE: null,
    INSTAGRAM: null,
    TWITCH: null,
    DISCORD: null,
    HYPIXEL: null,
    TIKTOK: null,
  };
  const defaultStatsObject = {
    Arcade: {},
    Arena: {},
    Battleground: {},
    Bedwars: {},
    BuildBattle: {},
    Duels: {},
    GingerBread: {},
    HungerGames: {},
    MCGO: {},
    MurderMystery: {},
    Paintball: {},
    Pit: {},
    Quake: {},
    SkyClash: {},
    SkyWars: {},
    SkyBlock: {},
    SpeedUHC: {},
    SuperSmash: {},
    TNTGames: {},
    TrueCombat: {},
    UHC: {},
    VampireZ: {},
    Walls: {},
    Walls3: {},
  };
  const statsObject = {};
  const fullStats = Object.assign(defaultStatsObject, stats);
  Object.keys(fullStats).forEach((game) => {
    if (Object.hasOwnProperty.call(processStats, game)) {
      const standardName = DBToStandardName(game);
      statsObject[standardName] = processStats[game](fullStats[game]);
    }
  });
  let totalKills = 0;
  let totalWins = 0;
  let totalCoins = 0;
  let totalGamesPlayed = 0;
  Object.keys(statsObject).forEach((game) => {
    totalKills += statsObject[game].kills || 0;
    totalWins += statsObject[game].wins || 0;
    totalCoins += statsObject[game].coins || 0;
    totalGamesPlayed += statsObject[game].games_played || 0;
  });
  const newRank = getPlayerRank(rank, packageRank, newPackageRank, monthlyPackageRank);
  const newRankPlusColor = colorNameToCode(rankPlusColor);
  const newPrefix = betterFormatting(prefix);
  const rankPlusPlusColor = colorNameToCode(monthlyRankColor);
  karma = karma.toFixed(0);
  return {
    uuid,
    username: displayname,
    online: getOnlineStatus(lastLogin, lastLogout),
    rank: newRank,
    rank_plus_color: newRankPlusColor,
    rank_formatted: generateFormattedRank(newRank, newRankPlusColor, newPrefix, rankPlusPlusColor),
    prefix: newPrefix,
    karma,
    exp: networkExp,
    level: Number(calculateLevel.getExactLevel(networkExp).toFixed(2)),
    achievement_points: achievementPoints === 0 ? achievements_.achievement_points : achievementPoints,
    quests_completed: quests_.quests_completed,
    total_games_played: totalGamesPlayed,
    total_kills: totalKills,
    total_wins: totalWins,
    total_coins: totalCoins.toFixed(0),
    mc_version: mcVersionRp,
    first_login: getFirstLogin(firstLogin, _id),
    last_login: lastLogin,
    last_logout: lastLogout,
    last_game: typeToCleanName(mostRecentGameType),
    language: userLanguage,
    gifts_sent: realBundlesGiven,
    gifts_received: realBundlesReceived,
    ranks_sent: ranksGiven,
    is_contributor: isContributor(uuid),
    rewards: {
      streak_current: rewardScore,
      streak_best: rewardHighScore,
      claimed: totalRewards,
      claimed_daily: totalDailyRewards,
      tokens: adsense_tokens,
    },
    voting: {
      votes_today: votesToday,
      total_votes: total,
      last_vote,
    },
    links: Object.assign(defaultLinks, links),
    stats: statsObject,
    achievements: achievements_,
    quests: quests_,
  };
}

module.exports = processPlayerData;
