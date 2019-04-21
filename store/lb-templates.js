module.exports = {
  general: {
    name: 'General',
    items: {
      achievements: {
        name: 'Achievements',
        fields: ['achievement_points'],
        sortBy: 'achievement_points',
      },
      level: {
        name: 'Level',
        fields: ['level'],
        sortBy: 'level',
      },
      karma: {
        name: 'Karma',
        fields: ['karma'],
        sortBy: 'karma',
      },
    },
  },
  guild: {
    name: 'Guild',
    items: {
      level: {
        name: 'Level',
        fields: ['name', 'tag', 'tag_color', 'members', 'created', 'level', 'experience', 'legacy_ranking'],
        sortBy: 'experience',
      },
    },
  },
  games: {
    name: 'Games',
    items: {},
  },
};
