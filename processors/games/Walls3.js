/*
* Mega Walls
 */

const { getRatio } = require('../../util/utility');

module.exports = ({
  coins = 0,
  kills = 0,
  assists = 0,
  deaths = 0,
  final_kills = 0,
  final_assists = 0,
  final_deaths = 0,
  wins = 0,
  losses = 0,
  wither_damage = 0,
  defender_kills = 0,
}) => ({
  coins,
  kills,
  assists,
  deaths,
  kill_death_ratio: getRatio(kills, deaths),
  final_kills,
  final_assists,
  final_deaths,
  final_kill_death_ratio: getRatio(final_kills, final_deaths),
  wins,
  losses,
  win_loss_ratio: getRatio(wins, losses),
  wither_damage,
  defending_kills: defender_kills,
});
