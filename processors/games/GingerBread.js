/* eslint-disable camelcase */
const { getRatio } = require('../../util/utility');
/*
* Turbo Kart Racers
 */
module.exports = ({
  coins = 0,
  coins_picked_up = 0,
  laps_completed = 0,
  wins = 0,
  box_pickups = 0,
  banana_hits_received = 0,
  banana_hits_sent = 0,
  gold_trophy = 0,
  silver_trophy = 0,
  bronze_trophy = 0,
  // retro
  retro_plays = 0,
  gold_trophy_retro = 0,
  silver_trophy_retro = 0,
  bronze_trophy_retro = 0,
  // hypixelgp
  hypixelgp_plays = 0,
  gold_trophy_hypixelgp = 0,
  silver_trophy_hypixelgp = 0,
  bronze_trophy_hypixelgp = 0,
  // junglerush
  junglerush_plays = 0,
  gold_trophy_junglerush = 0,
  silver_trophy_junglerush = 0,
  bronze_trophy_junglerush = 0,
  // olympus
  olympus_plays = 0,
  gold_trophy_olympus = 0,
  silver_trophy_olympus = 0,
  bronze_trophy_olympus = 0,
  // canyon
  canyon_plays = 0,
  gold_trophy_canyon = 0,
  silver_trophy_canyon = 0,
  bronze_trophy_canyon = 0,
}) => {
  const retroWins = gold_trophy_retro + silver_trophy_retro + bronze_trophy_retro;
  const hypixelgpWins = gold_trophy_hypixelgp + silver_trophy_hypixelgp + bronze_trophy_hypixelgp;
  const junglerushWins = gold_trophy_junglerush + gold_trophy_junglerush + bronze_trophy_junglerush;
  const olympusWins = gold_trophy_olympus + silver_trophy_olympus + bronze_trophy_olympus;
  const canyonWins = gold_trophy_canyon + silver_trophy_canyon + bronze_trophy_canyon;
  return {
    coins,
    coin_pickups: coins_picked_up,
    laps: laps_completed,
    wins,
    box_pickups,
    bananas_sent: banana_hits_sent,
    bananas_received: banana_hits_received,
    banana_ratio: getRatio(banana_hits_sent, banana_hits_received),
    trophies: {
      gold: gold_trophy,
      silver: silver_trophy,
      bronze: bronze_trophy,
    },
    maps: {
      retro: {
        games: retro_plays,
        win_ratio: getRatio(retroWins, retro_plays),
        trophies: {
          gold: gold_trophy_retro,
          silver: silver_trophy_retro,
          bronze: bronze_trophy_retro,
        },
      },
      hypixelgp: {
        games: hypixelgp_plays,
        win_ratio: getRatio(hypixelgpWins, hypixelgp_plays),
        trophies: {
          gold: gold_trophy_hypixelgp,
          silver: silver_trophy_hypixelgp,
          bronze: bronze_trophy_hypixelgp,
        },
      },
      junglerush: {
        games: junglerush_plays,
        win_ratio: getRatio(junglerushWins, junglerush_plays),
        trophies: {
          gold: gold_trophy_junglerush,
          silver: silver_trophy_junglerush,
          bronze: bronze_trophy_junglerush,
        },
      },
      olympus: {
        games: olympus_plays,
        win_ratio: getRatio(olympusWins, olympus_plays),
        trophies: {
          gold: gold_trophy_olympus,
          silver: silver_trophy_olympus,
          bronze: bronze_trophy_olympus,
        },
      },
      canyon: {
        games: canyon_plays,
        win_ratio: getRatio(canyonWins, canyon_plays),
        trophies: {
          gold: gold_trophy_canyon,
          silver: silver_trophy_canyon,
          bronze: bronze_trophy_canyon,
        },
      },
    },
  };
};
