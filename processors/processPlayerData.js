const utility = require('../util/utility');
const calculateLevel = require('../util/calculateLevel');

const processStats = {
  Arcade({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  Arena({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  Battleground({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  Bedwars({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  BuildBattle({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  Duels({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  GingerBread({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  HungerGames({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  MCGO({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  MurderMystery({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  Paintball({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  Quake({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  SkyClash({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  SkyWars({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  SpeedUHC({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  SuperSmash({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  TNTGames({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  TrueCombat({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  UHC({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  VampireZ({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  Walls({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
  Walls3({
    coins = 0,
  }) {
    return {
      coins,
    };
  },
};

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
}) {
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
      statsObject[game] = processStats[game](fullStats[game]);
    }
  });
  return {
    uuid,
    username: playername,
    online: lastLogin > lastLogout,
    rank: getPlayerRank(rank, packageRank, newPackageRank, monthlyPackageRank),
    rank_plus_color: utility.colorNameToCode(rankPlusColor),
    prefix: utility.betterFormatting(prefix),
    karma,
    exp: networkExp,
    level: Number(calculateLevel.getExactLevel(networkExp).toFixed(2)),
    achievement_points: achievementPoints,
    // totals here
    mc_version: mcVersionRp,
    first_login: firstLogin,
    last_login: lastLogin,
    last_game: utility.typeToStandardName(mostRecentGameType),
    language: userLanguage,
    gifts_sent: realBundlesGiven,
    gifts_received: realBundlesReceived,
    rewards: {
      streak_current: rewardScore,
      streak_best: rewardHighScore,
      claimed: totalRewards,
      claimed_daily: totalDailyRewards,
      tokens: adsense_tokens,
    },
    links: Object.assign(defaultLinks, links),
    stats: statsObject,
  };
}

module.exports = processPlayerData;
