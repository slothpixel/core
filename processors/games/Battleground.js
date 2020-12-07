/*
* Warlords
 */

const { getRatio } = require('../../util/utility');

module.exports = ({
  coins = 0,
  kills = 0,
  assists = 0,
  deaths = 0,
  wins = 0,
  wins_capturetheflag = 0,
  wins_domination = 0,
  wins_teamdeathmatch = 0,
  repaired = 0,
  flag_conquer_self = 0,
  flag_returns = 0,
}) => ({
  coins,
  kills,
  assists,
  deaths,
  kill_death_ratio: getRatio(kills, deaths),
  wins,
  wins_capturetheflag,
  wins_domination,
  wins_teamdeathmatch,
  weapons_repaired: repaired,
  flags_captured: flag_conquer_self,
  flags_returned: flag_returns,
});
