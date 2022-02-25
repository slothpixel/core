const { getRatio, pickKeys } = require('../../util/utility');
const { getLevelForExp, getLevelFormatted } = require('../../util/calculateBedWarsLevel');
/*
* Bedwars
 */
module.exports = ({
  coins = 0,
  wins_bedwars = 0,
  losses_bedwars = 0,
  games_played_bedwars_1 = 0,
  games_played_bedwars = 0,
  kills_bedwars = 0,
  deaths_bedwars = 0,
  Experience = 0,
  winstreak = 0,
  beds_broken_bedwars = 0,
  beds_lost_bedwars = 0,
  final_kills_bedwars = 0,
  final_deaths_bedwars = 0,
  void_kills_bedwars = 0,
  void_deaths_bedwars = 0,
  bedwars_boxes = 0,
  bedwars_box = 0,
  bedwars_box_commons = 0,
  bedwars_box_rares = 0,
  bedwars_box_epics = 0,
  bedwars_box_legendaries = 0,
  iron_resources_collected_bedwars = 0,
  gold_resources_collected_bedwars = 0,
  diamond_resources_collected_bedwars = 0,
  emerald_resources_collected_bedwars = 0,
  packages = [],
  practice = {},
  ...rest
}) => {
  const getModeStats = (regexp) => pickKeys(rest, {
    regexp,
    // who named these ;-;
    keyMap: (key) => key.replace(regexp, '')
      .replace(/^_/, '')
      .replace(' _', '_')
      .replace('_bedwars', '')
      .replace('__', '_'),
  });
  const gamemodes = {};
  const betterModeNames = {
    'eight_one(?!_rush|_ultimate)': 'solo',
    'eight_two(?!_rush|_ultimate|_lucky|_voidless|_armed)': 'doubles',
    four_three: '3v3v3v3',
    'four_four(?!_rush|_ultimate|_lucky|_voidless|_armed)': '4v4v4v4',
    two_four: '4v4',
    eight_one_rush: 'rush_solo',
    eight_two_rush: 'rush_doubles',
    four_four_rush: 'rush_4v4v4v4',
    eight_one_ultimate: 'ultimate_solo',
    eight_two_ultimate: 'ultimate_doubles',
    four_four_ultimate: 'ultimate_4v4v4v4',
    eight_two_lucky: 'lucky_doubles',
    four_four_lucky: 'lucky_4v4v4v4',
    eight_two_voidless: 'voidless_doubles',
    four_four_voidless: 'voidless_4v4v4v4',
    eight_two_armed: 'armed_doubles',
    four_four_armed: 'armed_4v4v4v4',
    castle: 'castle',
  };
  Object.keys(betterModeNames).forEach((name) => {
    gamemodes[betterModeNames[name]] = getModeStats(new RegExp(`^${name}_`));
  });
  Object.values(gamemodes).forEach((mode) => {
    mode.k_d = getRatio(mode.kills, mode.deaths);
    mode.w_l = getRatio(mode.wins, mode.losses);
    mode.final_k_d = getRatio(mode.final_kills, mode.final_deaths);
    mode.bed_ratio = getRatio(mode.beds_broken, mode.beds_lost);
  });
  const bedwarsLevel = getLevelForExp(Experience);
  return ({
    coins,
    exp: Experience,
    level: bedwarsLevel,
    level_formatted: getLevelFormatted(bedwarsLevel),
    wins: wins_bedwars,
    losses: losses_bedwars,
    games_played: games_played_bedwars_1,
    ingame_games_played: games_played_bedwars,
    kills: kills_bedwars,
    deaths: deaths_bedwars,
    k_d: getRatio(kills_bedwars, deaths_bedwars),
    w_l: getRatio(wins_bedwars, losses_bedwars),
    beds_broken: beds_broken_bedwars,
    beds_lost: beds_lost_bedwars,
    bed_ratio: getRatio(beds_broken_bedwars, beds_lost_bedwars),
    final_kills: final_kills_bedwars,
    final_deaths: final_deaths_bedwars,
    final_k_d: getRatio(final_kills_bedwars, final_deaths_bedwars),
    void_kills: void_kills_bedwars,
    void_deaths: void_deaths_bedwars,
    winstreak,
    boxes: {
      current: bedwars_boxes,
      opened: bedwars_box,
      commons: bedwars_box_commons,
      rares: bedwars_box_rares,
      epics: bedwars_box_epics,
      legendaries: bedwars_box_legendaries,
    },
    resources_collected: {
      iron: iron_resources_collected_bedwars,
      gold: gold_resources_collected_bedwars,
      diamond: diamond_resources_collected_bedwars,
      emerald: emerald_resources_collected_bedwars,
    },
    gamemodes,
    packages,
    practice,
  });
};
