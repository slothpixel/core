/*
* SkyWars
 */
const { getLevelForExp } = require('../../util/calculateSkyWarsLevel');
const { getRatio, pickKeys } = require('../../util/utility');

module.exports = ({
  coins = 0,
  games_played_skywars: games_played = 0,
  wins = 0,
  losses = 0,
  skywars_experience = 0,
  levelFormatted = '',
  kills = 0,
  deaths = 0,
  assists = 0,
  souls_gathered = 0,
  souls = 0,
  arrows_shot = 0,
  arrows_hit = 0,
  egg_thrown = 0,
  enderpearls_thrown = 0,
  blocks_placed = 0,
  blocks_broken = 0,
  soul_well = 0,
  soul_well_rares = 0,
  soul_well_legendaries = 0,
  heads = 0,
  heads_eww = 0,
  heads_yucky = 0,
  heads_meh = 0,
  heads_decent = 0,
  heads_salty = 0,
  heads_tasty = 0,
  heads_succulent = 0,
  heads_sweet = 0,
  heads_divine = 0,
  heads_heavenly = 0,
  ...rest
}) => {
  const getModeStats = (regexp) => pickKeys(rest, {
    regexp,
    keyMap: (key) => key.replace(regexp, ''),
  });
  const gamemodes = {};
  const betterModeNames = {
    '(?<!lab_)solo(?!_insane|_normal)': 'solo',
    solo_insane: 'solo_insane',
    solo_normal: 'solo_normal',
    '(?<!lab_)team(?!_insane|_normal)': 'team',
    team_insane: 'team_insane',
    team_normal: 'team_normal',
    'lab(?!_solo|_team)': 'lab',
    lab_solo: 'lab_solo',
    lab_team: 'lab_team',
    mega_normal: 'mega_normal',
    mega_doubles: 'mega_doubles',
    ranked: 'ranked',
  };
  Object.keys(betterModeNames).forEach((name) => {
    gamemodes[betterModeNames[name]] = getModeStats(new RegExp(`_${name}$`));
  });
  Object.keys(gamemodes).forEach((name) => {
    const mode = gamemodes[name];
    mode.kill_death_ratio = getRatio(mode.kills, mode.deaths);
    mode.win_loss_ratio = getRatio(mode.wins, mode.losses);
    mode.arrow_hit_miss_ratio = getRatio(mode.arrows_hit, mode.arrows_shot);
  });
  return ({
    coins,
    games_played,
    wins,
    losses,
    win_loss_ratio: getRatio(wins, losses),
    experience: skywars_experience,
    level: getLevelForExp(skywars_experience),
    levelFormatted: `${levelFormatted.replace(/§[\da-f]/g, '$&[').replace(/§/, '&')}]`,
    kills,
    deaths,
    assists,
    kill_death_ratio: getRatio(kills, deaths),
    souls_gathered,
    souls,
    arrows_shot,
    arrows_hit,
    arrow_hit_miss_ratio: getRatio(arrows_hit, arrows_shot),
    eggs_thrown: egg_thrown,
    enderpearls_thrown,
    blocks_placed,
    blocks_broken,
    soul_well_uses: soul_well,
    soul_well_rares,
    soul_well_legendaries,
    heads: {
      total_heads: heads,
      heads_eww,
      heads_yucky,
      heads_meh,
      heads_decent,
      heads_salty,
      heads_tasty,
      heads_succulent,
      heads_sweet,
      heads_divine,
      heads_heavenly,
    },
    gamemodes,
  });
};
