const { getRatio } = require('../../util/utility');
/*
* TNT Games
 */
module.exports = ({
  coins = 0,
  // TNT Run
  wins_tntrun = 0,
  deaths_tntrun = 0,
  record_tntrun = 0,
  // PVP Run
  wins_pvprun = 0,
  deaths_pvprun = 0,
  kills_pvprun = 0,
  record_pvprun = 0,
  // TNT Tag
  kills_tntag = 0,
  wins_tntag = 0,
  // Bow Spleef
  wins_bowspleef = 0,
  deaths_bowspleef = 0,
  // Wizards
  wins_capture = 0,
  kills_capture = 0,
  deaths_capture = 0,
  assists_capture = 0,
}) => ({
  coins,
  gamemodes: {
    tnt_run: {
      wins: wins_tntrun,
      losses: deaths_tntrun,
      win_loss_ratio: getRatio(wins_tntrun, deaths_tntrun),
      record_time_survived: record_tntrun,
    },
    pvp_run: {
      wins: wins_pvprun,
      losses: deaths_pvprun,
      win_loss_ratio: getRatio(wins_pvprun, deaths_pvprun),
      kills: kills_pvprun,
      record_time_survived: record_pvprun,
    },
    tnt_tag: {
      kills: kills_tntag,
      wins: wins_tntag,
    },
    bow_spleef: {
      wins: wins_bowspleef,
      losses: deaths_bowspleef,
      win_loss_ratio: getRatio(wins_bowspleef, deaths_bowspleef),
    },
    wizards: {
      wins: wins_capture,
      kills: kills_capture,
      deaths: deaths_capture,
      assists: assists_capture,
      kill_death_ratio: getRatio(kills_capture, deaths_capture),
    },
  },
});
