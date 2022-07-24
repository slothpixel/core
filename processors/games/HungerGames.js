/* eslint-disable camelcase */
/*
 * Blitz Survival Games
 */

const {
  getRatio,
  getWeeklyStat,
  getMonthlyStat,
  pickKeys,
} = require('../../util/utility');

module.exports = ({
  // General
  coins = 0,
  deaths = 0,
  kills = 0,
  wins = 0,
  wins_teams = 0,
  rambo_wins = 0,
  random_wins = 0,
  damage_taken = 0,
  taunt_kills = 0,
  potions_drunk = 0,
  damage = 0,
  mobs_spawned = 0,
  time_played = 0,
  arrows_hit = 0,
  games_played = 0,
  potions_thrown = 0,
  arrows_fired = 0,
  blitz_uses = 0,
  chests_opened = 0,
  monthly_kills_a = 0,
  monthly_kills_b = 0,
  weekly_kills_a = 0,
  weekly_kills_b = 0,

  // Kits
  arachnologist = 0,
  archer = 0,
  armorer = 0,
  astronaut = 0,
  baker = 0,
  blaze = 0,
  creepertamer = 0,
  diver = 0,
  farmer = 0,
  fisherman = 0,
  florist = 0,
  golem = 0,
  guardian = 0,
  horsetamer = 0,
  hunter = 0,
  'hype train': hype_train = 0,
  jockey = 0,
  knight = 0,
  meatmaster = 0,
  necromancer = 0,
  paladin = 0,
  random = 0,
  rambo = 0,
  pigman = 0,
  reaper = 0,
  reddragon = 0,
  rogue = 0,
  scout = 0,
  'shadow knight': shadow_knight = 0,
  slimeyslime = 0,
  snowman = 0,
  speleologist = 0,
  tim = 0,
  toxicologist = 0,
  troll = 0,
  viking = 0,
  warlock = 0,
  wolftamer = 0,

  // Equipped
  aura,
  chosen_taunt: taunt,
  chosen_victorydance: victory_dance,
  chosen_finisher: finisher,

  // Misc
  packages,
  defaultkit,
  combatTracker,
  autoarmor,
  togglekillcounter,

  // Other
  ...rest
}) => {
  const getKitStat = (regexp, options = {}) => pickKeys(rest, {
    regexp,
    keyMap: (key) => key.replace(regexp, '').trim().replace(' ', '_').replace(/'/g, '')
      .toLowerCase(),
    ...options,
  });

  const kitLevels = {
    arachnologist,
    archer,
    armorer,
    astronaut,
    baker,
    blaze,
    creepertamer,
    diver,
    farmer,
    fisherman,
    florist,
    golem,
    guardian,
    horsetamer,
    hunter,
    hype_train,
    jockey,
    knight,
    meatmaster,
    necromancer,
    paladin,
    random,
    rambo,
    pigman,
    reaper,
    reddragon,
    rogue,
    scout,
    shadow_knight,
    slimeyslime,
    snowman,
    speleologist,
    tim,
    toxicologist,
    troll,
    viking,
    warlock,
    wolftamer,
  };

  // Add one to all levels so the range is 1-10 instead of 0-9
  Object.keys(kitLevels).forEach((key) => {
    kitLevels[key] += 1;
  });

  const kit_stats = {
    wins: {
      solo: getKitStat(/^wins_(?!teams_)/),
      teams: getKitStat(/^wins_teams_/),
      total: {},
    },
    kills: getKitStat(/^kills_/),
    k_d: {},
    w_l: {},
    games_played: getKitStat(/^games_played_/),
    time_played: getKitStat(/^time_played_/),
    chests_opened: getKitStat(/^chests_opened_/),
    mobs_spawned: getKitStat(/^mobs_spawned_/),
    damage_taken: getKitStat(/^damage_taken_/),
    fall_damage: getKitStat(/^fall_damage_/),
    arrows_fired: getKitStat(/^arrows_fired_/),
    arrows_hit: getKitStat(/^arrows_hit_/),
    bottles_thrown: getKitStat(/^bottles_thrown_/),
    potions_drunk: getKitStat(/^potions_drunk_/),
    potions_thrown: getKitStat(/^potions_thrown_/),
    taunt_kills: getKitStat(/^taunt_kills_/),
    misc: {
      tim_items_enchanted: rest.items_enchanted_tim,
      blocks_traveled: getKitStat(/^blocks_traveled_/),
      creepertamer_explosive_kills: rest.explosive_kills_creepertamer,
      creepertamer_tnt_placed: rest.tnt_placed_creepertamer,
      snowman_snowballs_thrown: rest.snowballs_thrown_snowman,
      farmer_eggs_collected: rest.eggs_collected_farmer,
      farmer_eggs_thrown: rest.eggs_thrown_farmer,
      hype_train_rails_placed: rest['rails_placed_hype train'],
    },
  };

  // Calculate k_d, w_l and total wins for kits
  Object.keys(kit_stats.games_played).forEach((kit) => {
    kit_stats.wins.total[kit] = (kit_stats.wins.solo[kit] || 0) + (kit_stats.wins.teams[kit] || 0);
    kit_stats.k_d[kit] = getRatio(kit_stats.kills[kit], (kit_stats.games_played[kit] - ((kit_stats.wins.solo[kit] || 0) + (kit_stats.wins.teams[kit] || 0))));
    kit_stats.w_l[kit] = getRatio(
      ((kit_stats.wins.solo[kit] || 0) + (kit_stats.wins.teams[kit] || 0)),
      (kit_stats.games_played[kit] - ((kit_stats.wins.solo[kit] || 0) + (kit_stats.wins.teams[kit] || 0))),
    );
  });

  return {
    coins,
    deaths,
    kills,
    k_d: getRatio(kills, deaths),
    wins,
    team_wins: wins_teams,
    win_loss: getRatio(wins + wins_teams, deaths),
    win_percentage: getRatio(wins + wins_teams, wins + wins_teams + deaths),
    weekly_kills: getWeeklyStat(weekly_kills_a, weekly_kills_b),
    monthly_kills: getMonthlyStat(monthly_kills_a, monthly_kills_b),
    rambo_wins,
    random_wins,
    damage_taken,
    taunt_kills,
    potions_drunk,
    damage,
    mobs_spawned,
    time_played,
    arrows_hit,
    games_played,
    potions_thrown,
    arrows_fired,
    blitz_uses,
    chests_opened,

    kits_levels: kitLevels,
    kit_stats,
    equipped: {
      aura: aura && aura.toLowerCase(),
      taunt: taunt && taunt.toLowerCase(),
      victory_dance: victory_dance && victory_dance.toLowerCase(),
      finisher: finisher && finisher.toLowerCase(),
    },
    settings: {
      default_kit: defaultkit && defaultkit.toLowerCase(),
      combat_tracker: combatTracker,
      auto_armor: autoarmor,
      toggle_kill_counter: togglekillcounter,
    },
    votes: getKitStat(/^votes_/),
    inventories: getKitStat(/Inventory$/, {
      filter: (_, value) => typeof value === 'object',
      valueMap: Object.values,
    }),
    packages,
  };
};
