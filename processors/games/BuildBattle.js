/* eslint-disable camelcase */
const { getRatio, pickKeys } = require('../../util/utility');

/*
* Build Battle
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
  buildbattle_loadout = [],
  new_selected_hat = null,
  new_victory_dance = null,
  new_suit = null,
  active_movement_trail = null,
  selected_backdrop = null,
  packages = [],
  ...rest
}) => {
  // Theme ratings come in as 'votes_Theme: rating'
  // ex: 'votes_Roman: 5', 'votes_Steam Locomotive: 3'
  const themeRatings = pickKeys(rest, {
    regexp: /votes_.*/,
    keyMap: (key) => key.replace('votes_', ''),
  });
  return {
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
    loadout: buildbattle_loadout,
    selected_hat: new_selected_hat,
    selected_victory_dance: new_victory_dance,
    selected_suit: new_suit,
    selected_movement_trail: active_movement_trail,
    selected_backdrop,
    packages,
    themeRatings,
  };
};
