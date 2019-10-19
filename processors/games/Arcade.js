/*
* Arcade
 */
module.exports = ({
  coins = 0,
  // Blocking Dead
  wins_dayone = 0,
  kills_dayone = 0,
  headshots_dayone = 0,
  // Dragonwars
  wins__dragonwars2 = 0,
  kills_dragonwars2 = 0,
  // Hypixel Says
  wins_simon_says = 0,
  rounds_simon_says = 0,
  // Santa Says
  wins_santa_says = 0,
  rounds_santa_says = 0,
  // Mini Walls
  wins_mini_walls = 0,
  kills_mini_walls = 0,
  deaths_mini_walls = 0,
  final_kills_mini_walls = 0,
  arrows_shot_mini_walls = 0,
  arrows_hit_mini_walls = 0,
  wither_damage_mini_walls = 0,
  wither_kills_mini_walls = 0,
  miniwalls_activeKit = null,
  // Party Games
  wins_party = 0,
  wins_party_2 = 0,
  wins_party_3 = 0,
  // Bounty Hunters
  wins_oneinthequiver = 0,
  kills_oneinthequiver = 0,
  deaths_oneinthequiver = 0,
  bounty_kills_oneinthequiver = 0,
  // Galaxy Wars
  sw_game_wins = 0,
  sw_kills = 0,
  sw_deaths = 0,
  sw_rebel_kills = 0,
  sw_shots_fired = 0,
  // Farm Hunt
  wins_farm_hunt = 0,
  poop_collected = 0,
  // Football (not soccer)
  wins_soccer = 0,
  goals_soccer = 0,
  powerkicks_soccer = 0,
  // Creeper Attack
  max_wave = 0,
  // Hole in the Wall
  wins_hole_in_the_wall = 0,
  rounds_hole_in_the_wall = 0,
  hitw_record_q = 0,
  hitw_record_f = 0,
  // Zombies
  wins_zombies = 0,
  deaths_zombies = 0,
  total_rounds_survived_zombies = 0,
  bullets_hit_zombies = 0,
  headshots_zombies = 0,
  players_revived_zombies = 0,
  windows_repaired_zombies = 0,
  doors_opened_zombies = 0,
  zombie_kills_zombies = 0,
  best_round_zombies = 0,
}) => {
  const modes = {
    blocking_dead: {
      wins: wins_dayone,
      zombie_kills: kills_dayone,
      headshots: headshots_dayone,
    },
    dragonwars: {
      wins: wins__dragonwars2,
      kills: kills_dragonwars2,
    },
    hypixel_says: {
      wins: wins_simon_says,
      rounds: rounds_simon_says,
    },
    santa_says: {
      wins: wins_santa_says,
      rounds: rounds_santa_says,
    },
    miniwalls: {
      wins: wins_mini_walls,
      kills: kills_mini_walls,
      deaths: deaths_mini_walls,
      final_kills: final_kills_mini_walls,
      arrows_shot: arrows_shot_mini_walls,
      arrows_hit: arrows_hit_mini_walls,
      wither_damge: wither_damage_mini_walls,
      wither_kills: wither_kills_mini_walls,
      kit: miniwalls_activeKit,
    },
    party_games: {
      wins_1: wins_party,
      wins_2: wins_party_2,
      wins_3: wins_party_3,
    },
    bounty_hunters: {
      wins: wins_oneinthequiver,
      kills: kills_oneinthequiver,
      deaths: deaths_oneinthequiver,
      bounty_kills: bounty_kills_oneinthequiver,
    },
    galaxy_wars: {
      wins: sw_game_wins,
      kills: sw_kills,
      deaths: sw_deaths,
      rebel_kills: sw_rebel_kills,
      shots_fired: sw_shots_fired,
    },
    farm_hunt: {
      wins: wins_farm_hunt,
      poop_collected,
    },
    football: {
      wins: wins_soccer,
      goals: goals_soccer,
      powerkicks: powerkicks_soccer,
    },
    creeper_attack: {
      best_wave: max_wave,
    },
    hole_in_the_wall: {
      wins: wins_hole_in_the_wall,
      rounds: rounds_hole_in_the_wall,
      highest_score_qualification: hitw_record_q,
      highest_score_finals: hitw_record_f,
    },
    zombies: {
      wins: wins_zombies,
      zombie_kills: zombie_kills_zombies,
      deaths: deaths_zombies,
      total_rounds_survived: total_rounds_survived_zombies,
      bullets_hit: bullets_hit_zombies,
      headshots: headshots_zombies,
      players_revived: players_revived_zombies,
      windows_repaired: windows_repaired_zombies,
      doors_opened: doors_opened_zombies,
      best_round: best_round_zombies,
    },
  };
  // Totals
  let wins = 0;
  let kills = 0;
  Object.keys(modes).forEach((key) => {
    const mode = modes[key];
    if ('wins' in mode) wins += mode.wins;
    if ('kills' in mode) kills += mode.kills;
  });
  return ({
    coins,
    wins,
    kills,
    modes,
  });
};
