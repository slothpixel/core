const { getRatio, pickKeys } = require('../../util/utility');
/*
* Murder Mystery
 */
module.exports = ({
  detective_chance = 0,
  murderer_chance = 0,
  coins = 0,
  wins = 0,
  games = 0,
  kills = 0,
  bow_kills = 0,
  knife_kills = 0,
  thrown_knife_kills = 0,
  trap_kills = 0,
  deaths = 0,
  was_hero = 0,
  mm_chests = 0,
  detective_wins = 0,
  murderer_wins = 0,
  MurderMystery_openedChests = 0,
  MurderMystery_openedCommons = 0,
  MurderMystery_openedRares = 0,
  MurderMystery_openedEpics = 0,
  MurderMystery_openedLegendaries = 0,
  ...rest
}) => {
  const getModeStats = (regexp) => pickKeys(rest, {
    regexp,
    keyMap: (key) => key.replace(regexp, ''),
  });
  const gamemodes = {};
  const mapNames = [
    'headquarters',
    'library',
    'gold_rush',
    'hypixel_world',
    'archives',
    'transport',
    'ancient_tomb',
    'mountain',
    'cruise_ship',
    'towerfall',
    'hollywood',
    'aquarium',
    'san_peratico',
    'san_peratico_v2',
    'library',
    'darkfall',
    'widow\'s_den',
    'snowfall',
    'skyway_pier',
    'spooky_mansion',
    'snowglobe',
    'archives_top_floor',
  ];
  const betterModeNames = {
    MURDER_CLASSIC: 'classic',
    MURDER_DOUBLE_UP: 'double_up',
    MURDER_ASSASSINS: 'assassins',
    MURDER_INFECTION: 'infection',
  };
  Object.keys(betterModeNames).forEach((name) => {
    gamemodes[betterModeNames[name]] = getModeStats(new RegExp(`(?<!${mapNames.join('|')})_${name}$`));
  });
  Object.values(gamemodes).forEach((mode) => {
    mode.kill_death_ratio = getRatio(mode.kills, mode.deaths);
    mode.win_loss_ratio = getRatio(mode.wins, mode.games - mode.wins);
  });
  return ({
    detective_chance,
    murderer_chance,
    coins,
    wins,
    detective_wins,
    murderer_wins,
    losses: games - wins,
    games_played: games,
    win_loss_ratio: getRatio(wins, games - wins),
    kills,
    bow_kills,
    knife_kills,
    thrown_knife_kills,
    trap_kills,
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
    gamemodes,
  });
};
