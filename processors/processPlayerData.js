const utility = require('../util/utility');
const calculateLevel = require('../util/calculateLevel');

const processStats = require('./games');
const parseAchievements = require('./parseAchievements');
const parseQuests = require('./parseQuests');

function getPlayerRank(rank, packageRank, newPackageRank, monthlyPackageRank) {
  let playerRank;
  if (rank === 'NORMAL') {
    playerRank = newPackageRank || packageRank || null;
  } else {
    playerRank = rank || newPackageRank || packageRank || null;
  }

  if (playerRank === 'MVP_PLUS' && monthlyPackageRank === 'SUPERSTAR') {
    playerRank = 'MVP_PLUS_PLUS';
  }

  if (rank === 'NONE') {
    playerRank = null;
  }
  return playerRank;
}

/*
 * This function modifies the raw API response to the wanted format
 */
function processPlayerData({
  uuid,
  achievements,
  achievementsOneTime,
  quests,
  playername,
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
  giftingMeta: { realBundlesGiven = 0, realBundlesReceived = 0 } = {},
  rewardScore = 0,
  rewardHighScore = 0,
  totalRewards = 0,
  totalDailyRewards = 0,
  adsense_tokens = 0,
  socialMedia: { links = {} } = {},
  stats = {},
}, cb) {
  const achievementPromise = new Promise((resolve) => {
    resolve(parseAchievements(achievementsOneTime, achievements));
  });
  const questPromise = new Promise((resolve) => {
    resolve(parseQuests(quests));
  });
  const defaultLinks = {
    TWITTER: null,
    YOUTUBE: null,
    INSTAGRAM: null,
    TWITCH: null,
    MIXER: null,
    DISCORD: null,
    HYPIXEL: null,
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
    Quake: {},
    SkyClash: {},
    SkyWars: {},
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
      const standardName = utility.DBToStandardName(game);
      statsObject[standardName] = processStats[game](fullStats[game]);
    }
  });
  let totalKills = 0;
  let totalWins = 0;
  let totalCoins = 0;
  Object.keys(statsObject).forEach((game) => {
    totalKills += statsObject[game].kills || 0;
    totalWins += statsObject[game].wins || 0;
    totalCoins += statsObject[game].coins || 0;
  });
  let achievementObj = {};
  let questObject = {};
  const newRank = getPlayerRank(rank, packageRank, newPackageRank, monthlyPackageRank);
  const newRankPlusColor = utility.colorNameToCode(rankPlusColor);
  const newPrefix = utility.betterFormatting(prefix);
  const rankPlusPlusColor = utility.colorNameToCode(monthlyRankColor);
  Promise.all([achievementPromise, questPromise])
    .then((values) => {
      [achievementObj, questObject] = values;
    }, (err) => {
      Error(`Failed parsing quest or achievements: ${err}`);
    }).then(() => {
      cb({
        uuid,
        username: playername,
        online: lastLogin > lastLogout,
        rank: newRank,
        rank_plus_color: newRankPlusColor,
        rank_formatted: utility.generateFormattedRank(newRank, newRankPlusColor, newPrefix, rankPlusPlusColor),
        prefix: newPrefix,
        karma,
        exp: networkExp,
        level: Number(calculateLevel.getExactLevel(networkExp).toFixed(2)),
        achievement_points: achievementPoints,
        total_kills: totalKills,
        total_wins: totalWins,
        total_coins: totalCoins,
        mc_version: mcVersionRp,
        first_login: firstLogin,
        last_login: lastLogin,
        last_game: utility.typeToStandardName(mostRecentGameType),
        language: userLanguage,
        gifts_sent: realBundlesGiven,
        gifts_received: realBundlesReceived,
        is_contributor: utility.isContributor(uuid),
        rewards: {
          streak_current: rewardScore,
          streak_best: rewardHighScore,
          claimed: totalRewards,
          claimed_daily: totalDailyRewards,
          tokens: adsense_tokens,
        },
        links: Object.assign(defaultLinks, links),
        stats: statsObject,
        achievements: achievementObj,
        quests: questObject,
      });
    });
}

module.exports = processPlayerData;
