/*
* Paintball
 */
module.exports = ({
  coins = 0,
}) => ({
  coins,
});
/* eslint-disable camelcase */
/*
 * Paintball
 */

const { getRatio, getMonthlyStat, getWeeklyStat } = require('../../util/utility');

module.exports = ({
  adrenaline,
  coins,
  deaths,
  endurance,
  forcefieldTime,
  fortune,
  godfather,
  hat,
  kills,
  killstreaks,
  monthly_kills_a,
  monthly_kills_b,
  packages,
  shots_fired,
  superluck,
  transfusion,
  votes_Babyland,
  votes_Boletus,
  votes_Courtyard,
  votes_Gladiator,
  votes_Herobrine,
  votes_Juice,
  votes_LaLaLand,
  votes_Octagon,
  'votes_Oh Canada!': votes_OhCanada,
  votes_Outback,
  votes_Victorian,
  weekly_kills_a,
  weekly_kills_b,
  wins,
}) => ({
  coins,
  kills,
  deaths,
  kd: getRatio(kills, deaths),
  wins,
  weekly_kills: getWeeklyStat(weekly_kills_a, weekly_kills_b),
  monthly_kills: getMonthlyStat(monthly_kills_a, monthly_kills_b),
  killstreaks,
  shots_fired,
  hat,
  force_field_time: forcefieldTime,
  perks: {
    adrenaline: adrenaline && adrenaline + 1,
    endurance: endurance && endurance + 1,
    fortune: fortune && fortune + 1,
    godfather: godfather && godfather + 1,
    superluck: superluck && superluck + 1,
    transfusion: transfusion && transfusion + 1,
  },
  votes: {
    babyland: votes_Babyland,
    boletus: votes_Boletus,
    courtyard: votes_Courtyard,
    gladiator: votes_Gladiator,
    herobrine: votes_Herobrine,
    juice: votes_Juice,
    lalaland: votes_LaLaLand,
    octagon: votes_Octagon,
    oh_canada: votes_OhCanada,
    outback: votes_Outback,
    victorian: votes_Victorian,
  },
  packages,
});
