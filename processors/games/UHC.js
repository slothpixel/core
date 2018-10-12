/* eslint-disable camelcase */
/*
 * UHC
 */

const { getWeeklyStat, getMonthlyStat, pickKeys } = require('../../util/utility');

module.exports = ({
  // General
  coins,
  deaths,
  deaths_solo,
  'deaths_red vs blue': deaths_redvblue,
  kills,
  kills_solo,
  'kills_red vs blue': kills_redvblue,
  wins,
  wins_solo,
  'wins_red vs blue': wins_redvblue,
  score,
  heads_eaten,
  heads_eaten_solo,
  'heads_eaten_red vs blue': heads_eaten_redvblue,

  // Monthly stats
  monthly_kills__a,
  monthly_kills__b,
  monthly_kills__solo_a,
  monthly_kills__solo_b,
  monthly_wins__a,
  monthly_wins__b,
  monthly_wins__solo_a,
  monthly_wins__solo_b,

  // Weekly stats
  monthly_kills_a: weekly_kills_a,
  monthly_kills_b: weekly_kills_b,
  monthly_wins_a: weekly_wins_a,
  monthly_wins_b: weekly_wins_b,

  // Kits
  kit_ARCHERY_TOOLS,
  kit_ECOLOGIST,
  kit_FARMER,
  kit_HORSEMAN,
  kit_LEATHER_ARMOR,
  kit_LOOTER,
  kit_LUNCH_BOX,
  kit_MAGIC_TOOLS,
  kit_WORKING_TOOLS,

  // settings
  cache3,
  clearup_achievement,
  equippedKit,

  // Misc
  saved_stats,
  packages,
  ...rest
}) => {
  const perks = ['alchemy', 'apprentice', 'armorsmith', 'bloodcraft', 'cooking', 'enchanting', 'engineering', 'hunter', 'survivalism', 'toolsmithing', 'weaponsmith']
    .map(perk => [perk, pickKeys(rest, { regexp: new RegExp(`perk_${perk}_`) })])
    .reduce((prev, [key, value]) => ({ ...prev, [key]: value }), {});

  return {
    coins,
    deaths,
    kills,
    wins,
    score,
    heads_eaten,
    weekly_kills: getWeeklyStat(weekly_kills_a, weekly_kills_b),
    weekly_wins: getWeeklyStat(weekly_wins_a, weekly_wins_b),
    monthly_kills: getMonthlyStat(monthly_kills__a, monthly_kills__b),
    monthly_wins: getMonthlyStat(monthly_wins__a, monthly_wins__b),
    gamemodes: {
      solo: {
        deaths: deaths_solo,
        kills: kills_solo,
        wins: wins_solo,
        heads_eaten: heads_eaten_solo,
        monthly_kills: getMonthlyStat(monthly_kills__solo_a, monthly_kills__solo_b),
        monthly_wins: getMonthlyStat(monthly_wins__solo_a, monthly_wins__solo_b),
      },
      red_v_blue: {
        deaths: deaths_redvblue,
        kills: kills_redvblue,
        wins: wins_redvblue,
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
