/* eslint-disable camelcase */
/*
 * The Pit
 */

const {
  getRatio,
  pickKeys,
} = require('../../util/utility');

// TODO - Decode the inventory data to more readable format
const getInventory = (object) => object.data;

function mergeStats({
  chat_messages = 0,
  playtime_minutes = 0,
  enderchest_opened = 0,
  cash = 0,
  cash_earned = 0,
  left_clicks = 0,
  kills = 0,
  deaths = 0,
  assists = 0,
  joins = 0,
  renown = 0,
  renown_unlocks = [],
  xp = 0,
  prestiges = [],
  diamond_items_purchased = 0,
  // Damage stats
  damage_dealt = 0,
  melee_damage_dealt = 0,
  bow_damage_dealt = 0,
  damage_received = 0,
  melee_damage_received = 0,
  bow_damage_received = 0,
  // Misc
  sword_hits = 0,
  arrows_fired = 0,
  arrow_hits = 0,
  jumped_into_pit = 0,
  launched_by_launchers = 0,
  max_streak = 0,
  blocks_placed = 0,
  block_broken = 0,
  gapple_eaten = 0,
  ghead_eaten = 0,
  lava_bucket_emptied = 0,
  fishing_rod_launched = 0,
  soups_drank = 0,
  last_save = null,
  king_quest = {},
  sewer_treasures_found = 0,
  wheat_farmed = 0,
  night_quests_completed = 0,
  dark_pants_crated = 0, // typo lol
  // Contracts
  contracts_started = 0,
  contracts_completed = 0,
  // Inventories
  inv_contents = {},
  inv_armor = {},
  inv_enderchest = {},
  item_stash = {},
  hotbar_favorites = {},
  // Selected perks
  selected_perk_0 = null,
  selected_perk_1 = null,
  selected_perk_2 = null,
  selected_perk_3 = null,
  // Rest
  ...rest
}) {
  const getCoinsDuringPrestige = (regexp) => pickKeys(rest, {
    regexp,
    keyMap: (key) => key.replace(regexp, ''),
    valueMap: (value) => Math.round(value),
  });

  return {
    kills,
    assists,
    deaths,
    kd_ratio: getRatio(kills, deaths),
    sword_hits,
    arrows_fired,
    arrow_hits,
    arrow_accuracy: getRatio(arrows_fired, arrow_hits),
    chat_messages,
    playtime_minutes,
    enderchest_opened,
    gold: Math.round(cash),
    gold_earned: Math.round(cash_earned),
    xp,
    prestige: prestiges.length,
    renown,
    renown_unlocks,
    left_clicks,
    joins,
    last_save,
    contracts_started,
    contracts_completed,
    king_quest,
    diamond_items_purchased,
    jumped_into_pit,
    launched_by_launchers,
    max_streak,
    blocks_placed,
    block_broken,
    lava_bucket_emptied,
    gapple_eaten,
    ghead_eaten,
    fishing_rod_launched,
    soups_drank,
    sewer_treasures_found,
    night_quests_completed,
    wheat_farmed,
    dark_pants_created: dark_pants_crated,
    gold_during_prestige: getCoinsDuringPrestige(/^cash_during_prestige_/),
    selected_perks: {
      1: selected_perk_0,
      2: selected_perk_1,
      3: selected_perk_2,
      4: selected_perk_3,
    },
    items: {
      inventory: getInventory(inv_contents),
      armor: getInventory(inv_armor),
      enderchest: getInventory(inv_enderchest),
      stash: getInventory(item_stash),
      hotbar_favorites: getInventory(hotbar_favorites),
    },
    damage_dealt: {
      total: damage_dealt,
      melee: melee_damage_dealt,
      bow: bow_damage_dealt,
    },
    damage_taken: {
      total: damage_received,
      melee: melee_damage_received,
      bow: bow_damage_received,
    },
  };
}

module.exports = ({
  profile = {},
  pit_stats_ptl = {},
}) => mergeStats({ ...profile, ...pit_stats_ptl });
