/*
* SkyWars
 */
const { getLevelForExp } = require('../../util/calculateSkyWarsLevel');
const { getRatio, pickKeys } = require('../../util/utility');

module.exports = ({
  coins = 0,
  wins = 0,
  losses = 0,
  skywars_experience = 0,
  levelFormatted = '',
  kills = 0,
  deaths = 0,
  assists = 0,
  souls_gathered = 0,
  souls = 0,
  arrows_shot = 0,
  arrows_hit = 0,
  egg_thrown = 0,
  enderpearls_thrown = 0,
  blocks_placed = 0,
  blocks_broken = 0,
  soul_well = 0,
  soul_well_rares = 0,
  soul_well_legendaries = 0,
  ...rest
}) => {
  const getModeStats = (regexp) => pickKeys(rest, {
    regexp,
    keyMap: (key) => key.replace(regexp, '')
  });
  const gamemodes = {};
  const betterModeNames = {
    'solo(?!_insane|_normal)': 'solo',
    solo_insane: 'solo_insane',
    solo_normal: 'solo_normal',
    'team(?!_insane|_normal)': 'team',
    team_insane: 'team_insane',
    team_normal: 'team_normal',
    'lab(?!_solo|_team)': 'lab',
    lab_solo: 'lab_solo',
    lab_team: 'lab_team',
  };
  Object.keys(betterModeNames).forEach((name) => {
    gamemodes[betterModeNames[name]] = getModeStats(new RegExp(`_${name}$`));
    gamemodes[betterModeNames[name]].kill_death_ratio = getRatio(gamemodes[betterModeNames[name]].kills, gamemodes[betterModeNames[name]].deaths);
    gamemodes[betterModeNames[name]].win_loss_ratio = getRatio(gamemodes[betterModeNames[name]].wins, gamemodes[betterModeNames[name]].losses);
  });
  Object.keys(gamemodes).forEach(function(name) {
    const mode = gamemodes[name];
    mode.kill_death_ratio = getRatio(mode.kills,mode.deaths);
    mode.kill_death_ratio = getRatio(mode.wins,mode.losses);
  });
  return ({
    coins,
    wins,
    losses,
    win_loss_ratio: getRatio(wins, losses),
    experience: skywars_experience,
    level: getLevelForExp(skywars_experience),
    levelFormatted: `${levelFormatted.replace(/§[\da-f]/g, '$&[')}]`,
    kills,
    deaths,
    assists,
    kill_death_ratio: getRatio(kills, deaths),
    souls_gathered,
    souls,
    arrows_shot,
    arrows_hit,
    arrow_hit_miss_ratio: getRatio(arrows_hit, arrows_shot),
    eggs_thrown: egg_thrown,
    enderpearls_thrown,
    blocks_placed,
    blocks_broken,
    soul_well_uses: soul_well,
    soul_well_rares,
    soul_well_legendaries,
    gamemodes,
  });
};
