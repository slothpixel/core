/* eslint-disable camelcase */
/*
 * VampireZ
 */

const {
  getWeeklyStat,
  getMonthlyStat,
  getRatio,
} = require('../../util/utility');

module.exports = ({
  coins = 0,
  gold_bought = 0,

  // Human stats
  human_deaths = 0,
  human_kills = 0,
  human_wins = 0,
  weekly_human_wins_a = 0,
  weekly_human_wins_b = 0,
  monthly_human_wins_a = 0,
  monthly_human_wins_b = 0,

  // Vampire stats
  vampire_deaths = 0,
  vampire_kills = 0,
  vampires_wins = 0,
  weekly_vampire_wins_a = 0,
  weekly_vampire_wins_b = 0,
  monthly_vampire_wins_a = 0,
  monthly_vampire_wins_b = 0,
  most_vampire_kills = 0,
  most_vampire_kills_new = 0,

  // Perks
  explosive_killer = 0,
  fireproofing = 0,
  frankensteins_monster = 0,
  gold_booster = 0,
  gold_starter = 0,
  renfield = 0,
  transfusion = 0,
  vampire_doubler = 0,
  vampiric_minion = 0,

  // Votes
  votes_Cavern = 0,
  votes_Church = 0,
  votes_Erias = 0,
  votes_Pyramids = 0,
  votes_Village = 0,

  // Misc
  zombie_double,
  zombie_kills = 0,
  updated_stats,
  packages,
}) => ({
  coins,
  gold_bought,
  human_stats: {
    deaths: human_deaths,
    kills: human_kills,
    kd: getRatio(human_kills, human_deaths),
    wins: human_wins,
    weekly_wins: getWeeklyStat(weekly_human_wins_a, weekly_human_wins_b),
    monthly_wins: getMonthlyStat(monthly_human_wins_a, monthly_human_wins_b),
  },
  vampire_stats: {
    deaths: vampire_deaths,
    kills: vampire_kills,
    kd: getRatio(vampire_kills, vampire_deaths),
    wins: vampires_wins,
    weekly_wins: getWeeklyStat(weekly_vampire_wins_a, weekly_vampire_wins_b),
    monthly_wins: getMonthlyStat(monthly_vampire_wins_a, monthly_vampire_wins_b),
    most_kills: most_vampire_kills,
    most_kills_new: most_vampire_kills_new,
  },
  perks: {
    explosive_killer,
    fireproofing,
    frankensteins_monster,
    gold_booster,
    gold_starter,
    renfield,
    transfusion,
    vampire_doubler,
    vampiric_minion,
  },
  votes: {
    cavern: votes_Cavern,
    church: votes_Church,
    erias: votes_Erias,
    pyramids: votes_Pyramids,
    village: votes_Village,
  },
  zombie_double,
  zombie_kills,
  updated_stats,
  packages,
});
