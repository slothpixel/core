/* eslint-disable camelcase */
/*
 * Blitz Survival Games
 */

const {
  getRatio,
  getWeeklyStat,
  getMonthlyStat,
} = require('../../util/utility');

module.exports = ({
  // General
  coins,
  deaths,
  kills,
  wins,
  wins_teams,
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

  monthly_kills_a,
  monthly_kills_b,
  weekly_kills_a,
  weekly_kills_b,

  // Kits
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
  'hype train': hype_train,
  jockey,
  knight,
  meatmaster,
  necromancer,
  paladin,
  pigman,
  reaper,
  reddragon,
  rogue,
  scout,
  'shadow knight': shadow_knight,
  slimeyslime,
  snowman,
  speleologist,
  tim,
  toxicologist,
  troll,
  viking,
  warlock,
  wolftamer,

  // Equipped
  aura,
  chosen_taunt: taunt,
  chosen_victorydance: victory_dance,
  chosen_finisher: finisher,

  // Misc
  packages,
  defaultkit,
  rambo_wins,
  combatTracker,
  autoarmor,
  random_wins,
  togglekillcounter,

  // Other
  ...rest
}) => {
  // Gets all stats whose key started with prefix
  const getKitStat = (prefix, filter) => {
    let entries = Object.entries(rest).filter(([key]) => key.startsWith(prefix));

    if (filter) {
      entries = entries.filter(([key]) => filter(key));
    }

    const stats = entries.reduce((prev, [key, val]) => {
      const normalizedKey = key.replace(prefix, '').replace(' ', '_');
      return {
        ...prev,
        [normalizedKey]: val,
      };
    }, {});

    // Return undefined instead of empty object
    return Object.keys(stats).length === 0 ? undefined : stats;
  };

  const inventories = Object.entries(rest)
    .filter(([key, val]) => key.endsWith('Inventory') && typeof val === 'object')
    .map(v => [v[0].replace('Inventory', '').replace(' ', '_').toLowerCase(), v[1]])
    .reduce((prev, curr) => {
      const key = curr[0];
      const val = Object.values(curr[1]);

      return {
        ...prev,
        [key]: val,
      };
    }, {});

  return {
    coins,
    deaths,
    kills,
    kd: getRatio(kills, deaths),
    wins,
    team_wins: wins_teams,
    win_loss: getRatio(wins + wins_teams, wins + wins_teams + deaths),
    weekly_kills: getWeeklyStat(weekly_kills_a, weekly_kills_b),
    monthly_kills: getMonthlyStat(monthly_kills_a, monthly_kills_b),
    rambo_wins,
    random_wins,
    kits_levels: {
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
    },
    kit_stats: {
      wins: {
        solo: getKitStat('wins_', key => key.indexOf('team') === -1),
        teams: getKitStat('wins_teams_'),
      },
      kills: getKitStat('kills_'),
      games_played: getKitStat('games_played_'),
      time_played: getKitStat('time_played_'),
      chests_opened: getKitStat('chests_opened_'),
      mobs_spawned: getKitStat('mobs_spawned_'),
      damage_taken: getKitStat('damage_taken_'),
      fall_damage: getKitStat('fall_damage_'),
      arrows_fired: getKitStat('arrows_fired_'),
      arrows_hit: getKitStat('arrows_hit_'),
      bottles_thrown: getKitStat('bottles_thrown_'),
      potions_drunk: getKitStat('potions_drunk_'),
      potions_thrown: getKitStat('potions_thrown_'),
      taunt_kills: getKitStat('taunt_kills_'),
      misc: {
        tim_items_enchanted: rest.items_enchanted_tim,
        blocks_traveled: getKitStat('blocks_traveled_'),
        creepertamer_explosive_kills: rest.explosive_kills_creepertamer,
        creepertamer_tnt_placed: rest.tnt_placed_creepertamer,
        snowman_snowballs_thrown: rest.snowballs_thrown_snowman,
        farmer_eggs_collected: rest.eggs_collected_farmer,
        farmer_eggs_thrown: rest.eggs_thrown_farmer,
        hype_train_rails_placed: rest['rails_placed_hype train'],
      },
    },
    equipped: {
      aura: aura && aura.toLowerCase(),
      taunt: taunt && taunt.toLowerCase(),
      victory_dance: victory_dance && victory_dance.toLowerCase(),
      finisher: finisher && finisher.toLowerCase(),
    },
    inventories,
    settings: {
      default_kit: defaultkit && defaultkit.toLowerCase(),
      combat_tracker: combatTracker,
      auto_armor: autoarmor,
      toggle_kill_counter: togglekillcounter,
    },
    votes: getKitStat('votes_'),
    packages,
  };
};
