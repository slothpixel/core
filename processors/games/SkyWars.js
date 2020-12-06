/*
* SkyWars
 */
const { getLevelForExp } = require('../../util/calculateSkyWarsLevel')
const { getRatio } = require('../../util/utility')

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
  soul_well_legendaries,
}) => ({
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
