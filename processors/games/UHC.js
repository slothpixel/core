/* eslint-disable camelcase */
/*
 * UHC
 */

const {
  getWeeklyStat, getMonthlyStat, getRatio, pickKeys, fromEntries,
} = require('../../util/utility');

const { getLevelForScore } = require('../../util/calculateUhcLevel');

module.exports = ({
  // General
  coins = 0,
  deaths = 0,
  deaths_solo = 0,
  'deaths_red vs blue': deaths_redvblue = 0,
  kills = 0,
  kills_solo = 0,
  'kills_red vs blue': kills_redvblue = 0,
  wins = 0,
  wins_solo = 0,
  'wins_red vs blue': wins_redvblue = 0,
  score = 0,
  heads_eaten = 0,
  heads_eaten_solo = 0,
  'heads_eaten_red vs blue': heads_eaten_redvblue = 0,

  // Monthly stats
  monthly_kills__a = 0,
  monthly_kills__b = 0,
  monthly_kills__solo_a = 0,
  monthly_kills__solo_b = 0,
  monthly_wins__a = 0,
  monthly_wins__b = 0,
  monthly_wins__solo_a = 0,
  monthly_wins__solo_b = 0,

  // Weekly stats
  monthly_kills_a: weekly_kills_a = 0,
  monthly_kills_b: weekly_kills_b = 0,
  monthly_wins_a: weekly_wins_a = 0,
  monthly_wins_b: weekly_wins_b = 0,

  // Kits
  kit_ARCHERY_TOOLS = 0,
  kit_ECOLOGIST = 0,
  kit_FARMER = 0,
  kit_HORSEMAN = 0,
  kit_LEATHER_ARMOR = 0,
  kit_LOOTER = 0,
  kit_LUNCH_BOX = 0,
  kit_MAGIC_TOOLS = 0,
  kit_WORKING_TOOLS = 0,

  // settings
  cache3,
  clearup_achievement,
  equippedKit,

  // Misc
  saved_stats,
  packages,
  ...rest
}) => {
  const perks = fromEntries(['alchemy', 'apprentice', 'armorsmith', 'bloodcraft', 'cooking', 'enchanting', 'engineering', 'hunter', 'survivalism', 'toolsmithing', 'weaponsmith']
    .map((perk) => [perk, pickKeys(rest, { regexp: new RegExp(`perk_${perk}_`) })]));

  return {
    coins,
    deaths,
    kills,
    kd: getRatio(kills, deaths),
    wins,
    win_loss: getRatio(wins, deaths),
    win_percentage: getRatio(wins, wins + deaths),
    score,
    level: getLevelForScore(score),
    heads_eaten,
    weekly_kills: getWeeklyStat(weekly_kills_a, weekly_kills_b),
    weekly_wins: getWeeklyStat(weekly_wins_a, weekly_wins_b),
    monthly_kills: getMonthlyStat(monthly_kills__a, monthly_kills__b),
    monthly_wins: getMonthlyStat(monthly_wins__a, monthly_wins__b),
    gamemodes: {
      solo: {
        deaths: deaths_solo,
        kills: kills_solo,
        kd: getRatio(kills_solo, deaths_solo),
        wins: wins_solo,
        win_loss: getRatio(wins_solo, deaths_solo),
        win_percentage: getRatio(wins_solo, wins_solo + deaths_solo),
        heads_eaten: heads_eaten_solo,
        monthly_kills: getMonthlyStat(monthly_kills__solo_a, monthly_kills__solo_b),
        monthly_wins: getMonthlyStat(monthly_wins__solo_a, monthly_wins__solo_b),
      },
      red_v_blue: {
        deaths: deaths_redvblue,
        kills: kills_redvblue,
        kd: getRatio(kills_redvblue, deaths_redvblue),
        wins: wins_redvblue,
        win_loss: getRatio(wins_redvblue, wins_redvblue + deaths_redvblue),
        heads_eaten: heads_eaten_redvblue,
      },
    },
    perks,
    kits: {
      archery_set: kit_ARCHERY_TOOLS,
      ecologist: kit_ECOLOGIST,
      farmer: kit_FARMER,
      horseman: kit_HORSEMAN,
      leather_armor: kit_LEATHER_ARMOR,
      looter: kit_LOOTER,
      lunch_box: kit_LUNCH_BOX,
      enchanting_set: kit_MAGIC_TOOLS,
      stone_gear: kit_WORKING_TOOLS,
    },
    settings: {
      cache3,
      clearup_achievement,
      equipped_kit: equippedKit,
    },
    saved_stats,
    packages,
  };
};
