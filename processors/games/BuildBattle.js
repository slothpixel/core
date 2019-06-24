/* eslint-disable camelcase */
const { getRatio } = require('../../util/utility');
/*
* Build Battle
* TODO - Theme vote stats
 */
module.exports = ({
  coins = 0,
  score = 0,
  wins = 0,
  total_votes = 0,
  wins_solo_normal = 0,
  wins_solo_pro = 0,
  wins_teams_normal = 0,
  wins_guess_the_build = 0,
  correct_guesses = 0,
  games_played = 0,
  super_votes = 0,
  packages = [],
}) => ({
  coins,
  score,
  wins,
  w_r: getRatio(wins, (games_played - wins)),
  total_votes,
  wins_solo_normal,
  wins_solo_pro,
  wins_teams_normal,
  wins_guess_the_build,
  correct_guesses,
  games_played,
  super_votes,
  packages,
});
