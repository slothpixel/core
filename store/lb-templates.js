module.exports = {
  general: {
    name: 'General',
    items: {
      achievements: {
        name: 'Achievements',
        fields: ['achievement_points', 'level'],
        sortBy: 'achievement_points',
      },
      level: {
        name: 'Level',
        fields: ['level', 'exp'],
        sortBy: 'exp',
      },
      quests: {
        name: 'Quests Completed',
        fields: ['quests_completed', 'level'],
        sortBy: 'quests_completed',
      },
      karma: {
        name: 'Karma',
        fields: ['karma'],
        sortBy: 'karma',
      },
      dailyrewards: {
        name: 'Daily Reward Streak',
        fields: ['rewards.streak_current', 'rewards.streak_best', 'rewards.claimed', 'rewards.claimed_daily', 'rewards.tokens'],
        sortBy: 'rewards.streak_current',
      },
      kills: {
        name: 'Total Kills',
        fields: ['total_kills'],
        sortBy: 'total_kills',
      },
      wins: {
        name: 'Total Wins',
        fields: ['total_wins'],
        sortBy: 'total_wins',
      },
      coins: {
        name: 'Total Coins',
        fields: ['total_coins'],
        sortBy: 'total_coins',
      },
    },
  },
  guild: {
    name: 'Guild',
    items: {
      level: {
        name: 'Level',
        fields: ['name', 'tag', 'tag_color', 'members', 'created', 'level', 'exp', 'legacy_ranking'],
        sortBy: 'exp',
      },
    },
  },
  games: {
    name: 'Games',
    items: {},
  },
};
