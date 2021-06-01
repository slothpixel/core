/* eslint-disable camelcase */
/*
 * Duels
 */

const { pickKeys } = require('../../util/utility');

const pickGamemode = (object, gamePrefix) => ({
  ...pickKeys(object, {
    filter: (key) => key.startsWith(gamePrefix) && !key.endsWith('_kit_wins'),
    keyMap: (key) => key.replace(gamePrefix, '').replace(' ', '_'),
  }),
  kit_wins: pickKeys(object, {
    filter: (key) => key.startsWith(gamePrefix) && key.endsWith('_kit_wins'),
    keyMap: (key) => key.replace(gamePrefix, '').replace('_kit_wins', '').replace(' ', '_'),
  }),
});

// const doesObjectHaveKey = (object, key) => {
//   if (typeof object !== 'object') {
//     return false;
//   }

//   for (const subKey of Object.keys(object)) {
//     if (subKey === key || doesObjectHaveKey(object[subKey], key)) {
//       return true;
//     }
//   }

//   return false;
// };

module.exports = ({
  all_modes_gold_title_prestige = null,
  all_modes_iron_title_prestige = null,
  best_overall_winstreak = 0,
  blitz_duels_kit = 0,
  blitz_iron_title_prestige = 0,
  blitz_rookie_title_prestige = 0,
  blocks_placed = 0,
  bow_hits = 0,
  bow_shots = 0,
  bridge_deaths = 0,
  bridge_kills = 0,
  bridge_rookie_title_prestige = 0,
  bridgemapwins = 0,
  chat_enabled = 0,
  classic_rookie_title_prestige = 0,
  coins = 0,
  combo_rookie_title_prestige = 0,
  current_winstreak = 0,
  damage_dealt = 0,
  deaths = 0,
  duels_chest_history: chest_history = {},
  duels_chests: chests = 0,
  games_played_duels: games_played = 0,
  goals = 0,
  golden_apples_eaten = 0,
  heal_pots_used = 0,
  health_regenerated = 0,
  kills = 0,
  kit_menu_option = 0,
  kit_wins = 0,
  losses = 0,
  maps_won_on = [],
  melee_hits = 0,
  melee_swings = 0,
  meters_travelled = 0,
  mw_duels_class = 0,
  op_rookie_title_prestige = 0,
  packages = [],
  ranked_loss_streak_ranked_1: ranked_1_loss_streak = 0,
  ranked_streak_ranked_1: ranked_1_win_streak = 0,
  rounds_played = 0,
  sumo_rookie_title_prestige = 0,
  sw_duels_kit = 0,
  uhc_gold_title_prestige = 0,
  uhc_iron_title_prestige = 0,
  uhc_rookie_title_prestige = 0,
  wins = 0,

  ...rest
}) => ({
  general: {
    blocks_placed,
    bow_hits,
    bow_shots,
    chest_history,
    chests,
    coins,
    damage_dealt,
    deaths,
    games_played,
    goals,
    golden_apples_eaten,
    heal_pots_used,
    health_regenerated,
    kills,
    kit_wins,
    losses,
    maps_won_on,
    melee_hits,
    melee_swings,
    meters_travelled,
    rounds_played,
    wins,

    bow_hit_percentage: bow_shots === 0 ? 0 : bow_hits / bow_shots,
    kd_ratio: deaths === 0 ? 0 : kills / deaths,
    win_ratio: wins + losses === 0 ? 0 : wins / (wins + losses),
    win_loss_ratio: losses === 0 ? 0 : wins / losses,
    melee_hit_ratio: melee_swings === 0 ? 0 : melee_hits / melee_swings,

    gold_title_prestige: all_modes_gold_title_prestige,
    iron_title_prestige: all_modes_iron_title_prestige,

    winstreaks: {
      best: {
        overall: best_overall_winstreak,
        ...pickKeys(rest, {
          filter: (key) => key.startsWith('best_winstreak_mode_'),
          keyMap: (key) => key.replace('best_winstreak_mode_', ''),
        }),
      },
      current: {
        overall: current_winstreak,
        ...pickKeys(rest, {
          filter: (key) => key.startsWith('current_winstreak_mode_'),
          keyMap: (key) => key.replace('current_winstreak_mode_', ''),
        }),
      },
    },

    packages,
  },
  settings: {
    active_cosmetics: pickKeys(rest, {
      filter: (key) => key.startsWith('active_'),
      keyMap: (key) => key.replace('active_', ''),
    }),
    chat_enabled: chat_enabled === 'on',
    kit_menu_option: kit_menu_option === 'on',
  },
  gamemodes: {
    bridge: {
      deaths: bridge_deaths,
      kills: bridge_kills,
      rookie_title_prestige: bridge_rookie_title_prestige,
      map_wins: bridgemapwins,

      doubles: pickKeys(rest, {
        filter: (key) => key.startsWith('bridge_doubles_') && !key.endsWith('_kit_wins'),
        keyMap: (key) => key.replace('bridge_doubles_', '').replace('bridge_', ''),
      }),
      duels: pickKeys(rest, {
        filter: (key) => key.startsWith('bridge_duel_') && !key.endsWith('_kit_wins'),
        keyMap: (key) => key.replace('bridge_duel_', '').replace('bridge_', ''),
      }),
      fours: pickKeys(rest, {
        filter: (key) => key.startsWith('bridge_four_') && !key.endsWith('_kit_wins'),
        keyMap: (key) => key.replace('bridge_four_', '').replace('bridge_', ''),
      }),
      '2v2v2v2': pickKeys(rest, {
        filter: (key) => key.startsWith('bridge_2v2v2v2_') && !key.endsWith('_kit_wins'),
        keyMap: (key) => key.replace('bridge_2v2v2v2_', '').replace('bridge_', ''),
      }),
      '3v3v3v3': pickKeys(rest, {
        filter: (key) => key.startsWith('bridge_3v3v3v3_') && !key.endsWith('_kit_wins'),
        keyMap: (key) => key.replace('bridge_3v3v3v3_', '').replace('bridge_', ''),
      }),
    },
    blitz_duel: {
      iron_title_prestige: blitz_iron_title_prestige,
      rookie_title_prestige: blitz_rookie_title_prestige,
      kit: blitz_duels_kit,

      ...pickGamemode(rest, 'blitz_duel_'),
    },
    classic_duel: {
      rookie_title_prestige: classic_rookie_title_prestige,
      ...pickGamemode(rest, 'classic_duel_'),
    },
    combo_duel: {
      rookie_title_prestige: combo_rookie_title_prestige,
      ...pickGamemode(rest, 'combo_duel_'),
    },
    mega_walls_duels: {
      class: mw_duels_class,
      ...pickGamemode(rest, 'mw_duel_'),
    },
    op_duels: {
      rookie_title_prestige: op_rookie_title_prestige,
      ...pickGamemode(rest, 'op_duel_'),
    },
    ranked_duels: {
      win_streak: ranked_1_win_streak,
      loss_streak: ranked_1_loss_streak,
      ...pickGamemode(rest, 'ranked_1_'),
    },
    potion_duel: pickGamemode(rest, 'potion_duel_'),
    uhc: {
      rookie_title_prestige: uhc_rookie_title_prestige,
      gold_title_prestige: uhc_gold_title_prestige,
      iron_title_prestige: uhc_iron_title_prestige,

      doubles: pickGamemode(rest, 'uhc_doubles_'),
      duels: pickGamemode(rest, 'uhc_duels_'),
      fours: pickGamemode(rest, 'uhc_four_'),
      meetup: pickGamemode(rest, 'uhc_meetup_'),
      tournament: pickGamemode(rest, 'uhc_tournament_'),
    },
    skywars: {
      doubles: pickGamemode(rest, 'sw_doubles_'),
      duels: {
        kit: sw_duels_kit,
        ...pickGamemode(rest, 'sw_duel_'),
      },
      tournament: pickGamemode(rest, 'sw_tournament_'),
    },
    sumo: {
      rookie_title_prestige: sumo_rookie_title_prestige,
      ...pickGamemode(rest, 'sumo_duel_'),
    },
  },
});
