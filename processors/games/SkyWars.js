/*
* SkyWars
 */
const { getLevelForExp } = require('../../util/calculateSkyWarsLevel');
const { getRatio } = require('../../util/utility');

module.exports = ({
  coins = 0,
  wins = 0,
  losses = 0,
  skywars_experience = 0,
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
    
  };
  Object.keys(betterModeNames).forEach((name) => {
    gamemodes[betterModeNames[name]] = getModeStats(new RegExp(`^${name}_`));
    gamemodes[betterModeNames[name]].k_d = getRatio(gamemodes[betterModeNames[name]].kills,gamemodes[betterModeNames[name]].deaths);
    gamemodes[betterModeNames[name]].w_l = getRatio(gamemodes[betterModeNames[name]].wins,gamemodes[betterModeNames[name]].losses);
    gamemodes[betterModeNames[name]].final_k_d = getRatio(gamemodes[betterModeNames[name]].final_kills,gamemodes[betterModeNames[name]].final_deaths);
    gamemodes[betterModeNames[name]].bed_ratio = getRatio(gamemodes[betterModeNames[name]].beds_broken,gamemodes[betterModeNames[name]].beds_lost);
  });
  return ({
    coins,
    wins,
    losses,
    win_loss_ratio: getRatio(wins, losses),
    experience: skywars_experience,
    level: getLevelForExp(skywars_experience),
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
  });
}
