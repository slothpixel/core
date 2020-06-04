/* eslint-disable camelcase */
const async = require('async');
const { logger, decodeData, pickKeys } = require('../util/utility');
const SkyBlockUtils = require('../util/SkyBlockUtils');
const processInventoryData = require('./processInventoryData');

async function getInventory({ data = '' }) {
  if (data === '') return null;

  try {
    return processInventoryData(await decodeData(data));
  } catch (error) {
    logger.error(`getInventory failed: ${error}`);
    return null;
  }
}

// Process the stats object
function processStats({
  kills = 0,
  deaths = 0,
  ender_crystals_destroyed = 0,
  highest_critical_damage = 0,
  end_race_best_time = null,
  chicken_race_best_time_2 = null,
  gifts_given = 0,
  gifts_received = 0,
  most_winter_snowballs_hit = 0,
  most_winter_damage_dealt = 0,
  most_winter_magma_damage_dealt = 0,
  most_winter_cannonballs_hit = 0,
  items_fished = 0,
  items_fished_normal = 0,
  items_fished_treasure = 0,
  items_fished_large_treasure = 0,
  auctions_completed = 0,
  auctions_bids = 0,
  auctions_highest_bid = 0,
  auctions_won = 0,
  auctions_created = 0,
  auctions_no_bids = 0,
  auctions_fees = 0,
  auctions_gold_earned = 0,
  auctions_gold_spent = 0,
  ...rest
}) {
  const getStats = (regexp) => pickKeys(rest, {
    regexp,
    keyMap: (key) => key.replace(regexp, ''),
  });
  const auctions = {
    created: auctions_created,
    // Auctions that got bid on
    completed: auctions_completed,
    no_bids: auctions_no_bids,
    won: auctions_won,
    bids: auctions_bids,
    highest_bid: auctions_highest_bid,
    total_fees: auctions_fees,
    gold_earned: auctions_gold_earned,
    gold_spent: auctions_gold_spent,
    sold: getStats(/^auctions_sold_/),
    bought: getStats(/^auctions_bought_/),
  };
  return {
    total_kills: kills,
    total_deaths: deaths,
    kills: getStats(/^kills_/),
    deaths: getStats(/^deaths_/),
    highest_critical_damage: Math.round(highest_critical_damage),
    ender_crystals_destroyed,
    end_race_best_time: end_race_best_time ? end_race_best_time / 1000 : null,
    chicken_race_best_time: chicken_race_best_time_2 ? chicken_race_best_time_2 / 1000 : null,
    gifts_given,
    gifts_received,
    items_fished: {
      total: items_fished,
      normal: items_fished_normal,
      treasure: items_fished_treasure,
      large_treasure: items_fished_large_treasure,
    },
    auctions,
    winter_records: {
      snowballs_hit: most_winter_snowballs_hit,
      damage: most_winter_damage_dealt,
      magma_cube_damage: most_winter_magma_damage_dealt,
      cannonballs_hit: most_winter_cannonballs_hit,
    },
  };
}

const getUnlockedTier = (array) => {
  const o = {};
  array.forEach((gen) => {
    const regex = /_(-*\d+)$/;
    const name = gen.replace(regex, '');
    const tier = Number((regex.exec(gen) || [])[1] || -1);
    if (o[name] < tier || !(name in o)) {
      o[name] = tier;
    }
  });
  return o;
};

// TODO - Parse health, defence, intelligence etc.
async function processMember({
  last_save = null,
  first_join = null,
  pets = [],
  stats = {},
  coin_purse = 0,
  crafted_generators = [],
  slayer_bosses = {},
  unlocked_coll_tiers = [],
  collection = {},
  // Inventories
  inv_armor = {},
  inv_contents = {},
  fishing_bag = {},
  potion_bag = {},
  talisman_bag = {},
  quiver = {},
  ender_chest_contents = {},
  // Fairy souls
  fairy_souls_collected = 0,
  fairy_souls = 0,
  fairy_exchanges = 0,
  ...rest
}) {
  const getSkills = (regexp) => pickKeys(rest, {
    regexp,
    keyMap: (key) => key.replace(regexp, ''),
    valueMap: (value) => SkyBlockUtils.getLevelByXp(value),
  });
  const getSlayer = ({
    claimed_levels = {},
    xp = 0,
    boss_kills_tier_0,
    boss_kills_tier_1,
    boss_kills_tier_2,
    boss_kills_tier_3,
  }) => ({
    claimed_levels: Object.keys(claimed_levels).length,
    xp,
    kills_tier: {
      1: boss_kills_tier_0,
      2: boss_kills_tier_1,
      3: boss_kills_tier_2,
      4: boss_kills_tier_3,
    },
  });
  const collection_tiers = getUnlockedTier(unlocked_coll_tiers);
  const skills = getSkills(/^experience_skill_(?!runecrafting)/);
  skills.runecrafting = SkyBlockUtils.getLevelByXp(rest.experience_skill_runecrafting, true);
  return {
    player: {},
    last_save,
    first_join,
    coin_purse: Math.round(coin_purse),
    inventory: await getInventory(inv_contents),
    armor: await getInventory(inv_armor),
    ender_chest: await getInventory(ender_chest_contents),
    fishing_bag: await getInventory(fishing_bag),
    potion_bag: await getInventory(potion_bag),
    talisman_bag: await getInventory(talisman_bag),
    quiver: await getInventory(quiver),
    fairy_souls_collected,
    fairy_souls,
    fairy_exchanges,
    pets,
    skills,
    collection,
    collection_tiers,
    collections_unlocked: Object.keys(collection_tiers).length,
    minions: getUnlockedTier(crafted_generators),
    stats: processStats(stats),
    slayer: {
      zombie: getSlayer(slayer_bosses.zombie || {}),
      spider: getSlayer(slayer_bosses.spider || {}),
      wolf: getSlayer(slayer_bosses.wolf || {}),
    },
  };
}

async function processSkyBlock({
  profile_id = null,
  members = {},
  banking = {},
}) {
  const newMembers = {};
  await async.each(Object.keys(members), async (member) => {
    newMembers[member] = await processMember(members[member]);
  });
  return {
    profile_id,
    members: newMembers,
    banking: {
      balance: banking.balance || null,
      transactions: banking.transactions || [],
    },
  };
}

module.exports = processSkyBlock;
