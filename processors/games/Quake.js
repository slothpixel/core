/* eslint-disable camelcase */
/*
 * Quakecraft
 */

const {
  getRatio,
  getMonthlyStat,
  getWeeklyStat,
} = require('../../util/utility');

module.exports = ({
  barrel = '',
  case: _case = '',
  coins = 0,
  deaths = 0,
  kills = 0,
  killsound = '',
  killstreaks = 0,
  muzzle = '',
  packages = [],
  sight = '',
  trigger = '',
  wins = 0,
  wins_teams = 0,
  kills_teams = 0,
  deaths_teams = 0,
  killstreaks_teams = 0,
  monthly_kills_a = 0,
  weekly_kills_a = 0,
  monthly_kills_b = 0,
  weekly_kills_b = 0,
  instantRespawn,
  showKillPrefix,
  kills_timeattack = 0,
  kills_dm_teams = 0,
  kills_dm = 0,
  dash_power,
  dash_cooldown,
  alternative_gun_cooldown_indicator,
  compass_selected,
  enable_sound,
  highest_killstreak = 0,
  showDashCooldown,
  distance_travelled_teams = 0,
  shots_fired_teams = 0,
  headshots_teams = 0,
  headshots = 0,
  distance_travelled = 0,
  shots_fired = 0,
  'votes_Apex II': votes_ApexII = 0,
  votes_DigSite2 = 0,
  votes_Sero = 0,
  votes_Fryst = 0,
  votes_Cold_War = 0,
  votes_Demonic = 0,
  votes_Apex = 0,
  votes_Depths = 0,
  votes_DigSite = 0,
  votes_Martian = 0,
  votes_Ascended = 0,
  votes_Lost_World = 0,
  votes_Belmorn = 0,
  votes_Reactor = 0,
  'messageYour Deaths': message_YourDeaths,
  'messageYour Kills': message_YourKills,
  'messageCoin Messages': message_CoinMessages,
  "messageOthers' Kills/deaths": message_OthersKillsDeaths,
  messageKillstreaks: message_Killstreaks,
  'messageMulti-kills': message_Multikills,
  'messagePowerup Collections': message_PowerupCollections,
  beam,
}) => {
  const cosmetics = {
    misc: [],
  };

  packages.forEach((p) => {
    const [key, value] = p.split('.');

    if (value) {
      if (!Object.keys(cosmetics).includes(`${key}s`)) {
        cosmetics[`${key}s`] = [value];
      } else {
        cosmetics[`${key}s`].push(value);
      }
    } else {
      cosmetics.misc.push(key);
    }
  });

  return {
    coins,
    gamemodes: {
      solo: {
        wins,
        kills,
        deaths,
        kd: getRatio(kills, deaths),
        killstreaks,
        kills_dm,
        distance_travelled,
        shots_fired,
        headshots,
      },
      teams: {
        wins: wins_teams,
        kills: kills_teams,
        deaths: deaths_teams,
        kd: getRatio(kills_teams, deaths_teams),
        killstreaks: killstreaks_teams,
        kills_dm: kills_dm_teams,
        distance_travelled: distance_travelled_teams,
        shots_fired: shots_fired_teams,
        headshots: headshots_teams,
      },
    },
    kills_timeattack,
    highest_killstreak,
    weekly_kills: getWeeklyStat(weekly_kills_a, weekly_kills_b),
    monthly_kills: getMonthlyStat(monthly_kills_a, monthly_kills_b),
    dash_power: (dash_power && Number(dash_power)) || 0,
    dash_cooldown: (dash_cooldown && Number(dash_cooldown)) || 0,
    alternative_gun_cooldown_indicator,
    equipped_cosmetics: {
      barrel: barrel && barrel.toLowerCase(),
      case: _case && _case.toLowerCase(),
      killsound: killsound && killsound.toLowerCase(),
      muzzle: muzzle && muzzle.toLowerCase(),
      sight: sight && sight.toLowerCase(),
      trigger: trigger && trigger.toLowerCase(),
      beam: beam && beam.toLowerCase(),
    },
    cosmetics,
    settings: {
      instant_respawn: instantRespawn,
      show_kill_prefix: showKillPrefix,
      compass_selected,
      enable_sound,
      show_dash_cooldown: showDashCooldown,
      messages: {
        your_kills: message_YourKills,
        your_deaths: message_YourDeaths,
        others_kills_deaths: message_OthersKillsDeaths,
        coins: message_CoinMessages,
        killstreaks: message_Killstreaks,
        multikills: message_Multikills,
        powerups: message_PowerupCollections,
      },
    },
    votes: {
      apex: votes_Apex,
      apex2: votes_ApexII,
      ascended: votes_Ascended,
      belmorn: votes_Belmorn,
      cold_war: votes_Cold_War,
      demonic: votes_Demonic,
      depths: votes_Depths,
      digsite: votes_DigSite,
      digsite2: votes_DigSite2,
      fryst: votes_Fryst,
      lost_world: votes_Lost_World,
      martian: votes_Martian,
      reactor: votes_Reactor,
      sero: votes_Sero,
    },
  };
};
