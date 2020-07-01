const { getRatio, fromEntries } = require("../../util/utility");

/*
* SkyWars
 */
module.exports = ({
  coins,
  kills,
  assists,
  deaths,
  wins,
  losses,
  blocks_broken,
  blocked_placed,
  souls,
  soul_well: soul_well_uses,
  soul_well_legendaries,
  soul_well_rares,
  paid_souls,
  souls_gathered,
  egg_thrown: eggs_thrown,
  enderpearls_thrown,
  arrows_shot,
  arrows_hit,
  time_played,
  quits: games_quit,
  survived_players: players_survived,
  activeCage: active_cage,
  ...data
}) => ({
  coins,
  kills,
  assists,
  deaths,
  k_d: getRatio(kills, deaths),
  wins,
  losses,
  w_l: getRatio(wins, losses),
  blocks_broken,
  blocked_placed,
  souls: {
    current: souls,
    gathered: souls_gathered,
    paid: paid_souls,
    well: {
      uses: soul_well_uses,
      legendaries: soul_well_legendaries,
      rares: soul_well_rares
    }
  },
  thrown: {
    eggs: eggs_thrown,
    enderpearls: enderpearls_thrown
  },
  arrows: {
    shot: arrows_shot,
    hit: arrows_hit,
    accuracy: getRatio(arrows_hit, arrows_shot),
  },
  time_played,
  games_quit,
  players_survived,
  active_cage,
  modes: fromEntries(["solo_normal", "solo_insane", "team_normal", "team_insane", "mega", "ranked"].map(mode => {
    const returnedMode = mode
    if (mode === "ranked") {
      mode = "ranked_normal"
    }
    return [returnedMode, {
      kills: data[`kills_${mode}`],
      deaths: data[`deaths_${mode}`],
      k_d: getRatio(data[`kills_${mode}`], data[`deaths_${mode}`]),
      wins: data[`wins_${mode}`],
      losses: data[`losses_${mode}`],
      w_l: getRatio(data[`wins_${mode}`], data[`losses_${mode}`])
    }]
  })),
  kits: fromEntries(["solo", "team", "mega", "ranked"].map(mode => [mode, {
    active: data[`activeKit_${mode.toUpperCase()}`],
    random: data[`activeKit_${mode.toUpperCase()}_random`] // Returns undefined for ranked
  }]))
});
