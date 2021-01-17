const { getRatio } = require('../../util/utility');
/*
* Murder Mystery
 */
module.exports = ({
  coins = 0,
  wins = 0,
  games = 0,
  kills = 0,
  deaths = 0,
  was_hero = 0,
  mm_chests = 0,
  MurderMystery_openedChests = 0,
  MurderMystery_openedCommons = 0,
  MurderMystery_openedRares = 0,
  MurderMystery_openedEpics = 0,
  MurderMystery_openedLegendaries = 0,
}) => ({
  coins,
  wins,
  losses: games - wins,
  games_played: games,
  win_loss_ratio: getRatio(wins, games - wins),
  kills,
  deaths,
  kill_death_ratio: getRatio(kills, deaths),
  times_hero: was_hero,
  boxes: {
    current: mm_chests,
    opened: MurderMystery_openedChests,
    commons: MurderMystery_openedCommons,
    rares: MurderMystery_openedRares,
    epics: MurderMystery_openedEpics,
    legendaries: MurderMystery_openedLegendaries,
  },
});
