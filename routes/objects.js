const playerObject = {
  type: 'object',
  properties: {
    uuid: {
      description: 'Player uuid',
      type: 'string',
    },
    username: {
      description: 'Player username',
      type: 'string',
    },
    online: {
      description: 'Is player online',
      type: 'boolean',
    },
    rank: {
      description: 'Player rank',
      type: 'string',
    },
    rank_plus_color: {
      description: 'Color code for MVP+(+)',
      type: 'string',
      'x-default_value': '&c',
    },
    rank_formatted: {
      description: 'Formatted rank string',
      type: 'string',
    },
    prefix: {
      description: 'Custom rank prefix',
      type: 'string',
    },
    karma: {
      description: 'Player karma',
      type: 'integer',
    },
    exp: {
      description: 'Current Hypixel Experience',
      type: 'integer',
    },
    level: {
      description: 'Player level with precision of two decimals',
      type: 'number',
    },
    achievement_points: {
      description: 'Total achievement points',
      type: 'integer',
    },
    quests_completed: {
      description: 'Total quests completed',
      type: 'integer',
    },
    total_kills: {
      description: 'Total kills across all minigames',
      type: 'integer',
    },
    total_wins: {
      description: 'Total wins across all minigames',
      type: 'integer',
    },
    total_coins: {
      description: 'Total coins across all minigames',
      type: 'integer',
    },
    mc_version: {
      description: 'Minecraft version the user last logged on Hypixel with',
      type: 'string',
    },
    first_login: {
      description: 'Date of first Hypixel login',
      type: 'integer',
    },
    last_login: {
      description: 'Date of latest Hypixel login',
      type: 'integer',
    },
    last_logout: {
      description: 'Date of latest Hypixel logout',
      type: 'integer',
    },
    last_game: {
      description: 'Latest minigame played',
      type: 'string',
    },
    language: {
      description: 'Currently selected language',
      type: 'string',
    },
    gifts_sent: {
      description: 'Total gifts sent to other players',
      type: 'integer',
    },
    gifts_received: {
      description: 'Total gifts received from other players',
      type: 'integer',
    },
    is_contributor: {
      description: 'Whether player is a contributor to Slothpixel',
      type: 'boolean',
    },
    rewards: {
      description: 'Daily reward data',
      type: 'object',
      properties: {
        streak_current: {
          description: 'Current streak',
          type: 'integer',
        },
        streak_best: {
          description: 'Best streak',
          type: 'integer',
        },
        claimed: {
          description: 'Total rewards claimed',
          type: 'integer',
        },
        claimed_daily: {
          description: 'Daily rewards claimed',
          type: 'integer',
        },
        tokens: {
          description: 'Current reward tokens',
          type: 'integer',
        },
      },
    },
    links: {
      description: 'Social media links',
      type: 'object',
      properties: {
        TWITTER: {
          description: 'Link to Twitter profile',
          type: 'string',
        },
        YOUTUBE: {
          description: 'Link to YouTube channel',
          type: 'string',
        },
        INSTAGRAM: {
          description: 'Link to Instagram profile',
          type: 'string',
        },
        TWITCH: {
          description: 'Link to Twitch channel',
          type: 'string',
        },
        MIXER: {
          description: 'Link to Mixer channel',
          type: 'string',
        },
        DISCORD: {
          description: 'Discord handle, in full format of username#discriminator',
          type: 'string',
        },
        HYPIXEL: {
          description: 'Link to Hypixel Forums profile',
          type: 'string',
        },
      },
    },
    stats: {
      description: 'Player stats across all minigames',
      type: 'object',
      properties: {
        Arcade: {
          description: 'Player stats in the Arcade Games',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in the Arcade Games',
              type: 'integer',
            },
            blocking_dead: {
              description: 'Stats about Blocking Dead',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Blocking Dead',
                  type: 'integer',
                },
                zombie_kills: {
                  description: 'Amount of zombie kills in Blocking Dead',
                  type: 'integer',
                },
                headshots: {
                  description: 'Amount of headshots in Blocking Dead',
                  type: 'integer',
                },
              },
            },
            dragonwars: {
              description: 'Stats about Dragon Wars',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Dragon Wars',
                  type: 'integer',
                },
                kills: {
                  description: 'Amount of kills in Dragon Wars',
                  type: 'integer',
                },
              },
            },
            hypixel_says: {
              description: 'Stats about Hypixel Says',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Hypixel Says',
                  type: 'integer',
                },
                rounds: {
                  description: 'Amount of rounds played in Hypixel Says',
                  type: 'integer',
                },
              },
            },
            santa_says: {
              description: 'Stats about Santa Says',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Santa Says',
                  type: 'integer',
                },
                rounds: {
                  description: 'Amount of rounds played in Santa Says',
                  type: 'integer',
                },
              },
            },
            miniwalls: {
              description: 'Stats about Mini Walls',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Mini Walls',
                  type: 'integer',
                },
                kills: {
                  description: 'Amount of kills in Mini Walls',
                  type: 'integer',
                },
                deaths: {
                  description: 'Amount of deaths in Mini Walls',
                  type: 'integer',
                },
                final_kills: {
                  description: 'Amount of final kills in Mini Walls',
                  type: 'integer',
                },
                arrows_shot: {
                  description: 'The number of arrows shot in Mini Walls',
                  type: 'integer',
                },
                arrows_hit: {
                  description: 'Amount of arrows that hit their targets in Mini Walls',
                  type: 'integer',
                },
                wither_damage: {
                  description: 'Amount of wither damage taken in Mini Walls',
                  type: 'number',
                },
                wither_kills: {
                  description: 'Amount of withers killed in Mini Walls',
                  type: 'integer',
                },
                kit: {
                  description: 'Active kit',
                  type: 'any',
                },
              },
            },
            party_games: {
              description: 'Stats about Party Games',
              type: 'object',
              properties: {
                wins_1: {
                  description: 'Amount of wins in Party Games',
                  type: 'integer',
                },
                wins_2: {
                  description: 'Amount of wins in Party Games',
                  type: 'integer',
                },
                wins_3: {
                  description: 'Amount of wins in Party Games',
                  type: 'integer',
                },
              },
            },
            bounty_hunters: {
              description: 'Stats about Bounty Hunters',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Bounty Hunters',
                  type: 'integer',
                },
                kills: {
                  description: 'Amount of kills in Bounty Hunters',
                  type: 'integer',
                },
                deaths: {
                  description: 'Amount of deaths in Bounty Hunters',
                  type: 'integer',
                },
                bounty_kills: {
                  description: 'Amount of bounty kills in Bounty Hunters',
                  type: 'integer',
                },
              },
            },
            galaxy_wars: {
              description: 'Stats about Galaxy Wars',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Galaxy Wars',
                  type: 'integer',
                },
                kills: {
                  description: 'Amount of kills in Galaxy Wars',
                  type: 'integer',
                },
                deaths: {
                  description: 'Amount of deaths in Galaxy Wars',
                  type: 'integer',
                },
                rebel_kills: {
                  description: 'Amount of rebel kills in Galaxy Wars',
                  type: 'integer',
                },
                shots_fired: {
                  description: 'The number of shots fired in Galaxy Wars',
                  type: 'integer',
                },
              },
            },
            farm_hunt: {
              description: 'Stats about Farm Hunt',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Farm Hunt',
                  type: 'integer',
                },
                poop_collected: {
                  description: 'Amount of poop collected in Farm Hunt',
                  type: 'integer',
                },
              },
            },
            football: {
              description: 'Stats about Football',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Football',
                  type: 'integer',
                },
                goals: {
                  description: 'Amount of goals scored in Football',
                  type: 'integer',
                },
                powerkicks: {
                  description: 'Amount of powerkicks in Football',
                  type: 'integer',
                },
              },
            },
            creeper_attack: {
              description: 'Stats about Creeper Attack',
              type: 'object',
              properties: {
                best_wave: {
                  description: 'Best wave in Football',
                  type: 'integer',
                },
              },
            },
            hole_in_the_wall: {
              description: 'Stats about Hole in the Wall',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Hole in the Wall',
                  type: 'integer',
                },
                rounds: {
                  description: 'Amount of rounds played in Hole in the Wall',
                  type: 'integer',
                },
                highest_score_qualification: {
                  description: 'Highest score qualification in Hole in the Wall',
                  type: 'integer',
                },
                highest_score_finals: {
                  description: 'Highest score in finals in Hole in the Wall',
                  type: 'integer',
                },
              },
            },
            zombies: {
              description: 'Stats about Zombies',
              type: 'object',
              properties: {
                wins: {
                  description: 'Amount of wins in Zombies',
                  type: 'integer',
                },
                zombie_kills: {
                  description: 'Amount of zombie kills in Zombies',
                  type: 'integer',
                },
                deaths: {
                  description: 'Amount of deaths in Zombies',
                  type: 'integer',
                },
                total_rounds_survived: {
                  description: 'Total rounds survived in Zombies',
                  type: 'integer',
                },
                bullets_hit: {
                  description: 'Amount of bullets hit in Zombies',
                  type: 'integer',
                },
                headshots: {
                  description: 'Amount of headshots in Zombies',
                  type: 'integer',
                },
                players_revived: {
                  description: 'Amount of players revived in Zombies',
                  type: 'integer',
                },
                windows_repaired: {
                  description: 'Amount of windows repaired in Zombies',
                  type: 'integer',
                },
                doors_opened: {
                  description: 'Amount of doors opened in Zombies',
                  type: 'integer',
                },
                best_round: {
                  description: 'Best round in Zombies',
                  type: 'integer',
                },
              },
            },
          },
        },
        Arena: {
          description: 'Player stats in Arena Brawl',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins',
              type: 'integer',
            },
            coins_spent: {
              description: 'Total coins spent in Arena Brawl',
              type: 'integer',
            },
            hat: {
              description: 'Currently selected hat cosmetic',
              type: 'string',
            },
            penalty: {
              type: 'integer',
            },
            magical_chest: {
              type: 'integer',
            },
            keys: {
              description: 'Current number of Magical Chest keys',
              type: 'integer',
            },
            selected_sword: {
              description: 'Currently selected Sword cosmetic',
              type: 'string',
            },
            active_rune: {
              type: 'string',
            },
            skills: {
              description: 'Currently selected skills',
              type: 'object',
              properties: {
                offensive: {
                  description: 'Currently selected Offensive skill',
                  type: 'string',
                },
                support: {
                  description: 'Currently selected Support skill',
                  type: 'string',
                },
                utility: {
                  description: 'Currently selected Utility skill',
                  type: 'string',
                },
                ultimate: {
                  description: 'Currently selected Ultimate skill',
                  type: 'string',
                },
              },
            },
            combat_levels: {
              description: 'Current Combat Upgrades in Arena Brawl',
              type: 'object',
              properties: {
                melee: {
                  description: 'Current Melee Upgrade progression',
                  type: 'integer',
                },
                health: {
                  description: 'Current Health Upgrade progression',
                  type: 'integer',
                },
                energy: {
                  description: 'Current Energy Upgrade progression',
                  type: 'integer',
                },
                cooldown: {
                  description: 'Current Cooldown Upgrade progression',
                  type: 'integer',
                },
              },
            },
            rune_levels: {
              description: 'Current rune upgrades in Arena Brawl',
              type: 'object',
              properties: {
                damage: {
                  description: 'Rune of Damage upgrade progression',
                  type: 'integer',
                },
                energy: {
                  description: 'Rune of Energy upgrade progression',
                  type: 'integer',
                },
                slowing: {
                  description: 'Rune of Slowing upgrade progression',
                  type: 'integer',
                },
                speed: {
                  description: 'Rune of Speed upgrade progression',
                  type: 'integer',
                },
              },
            },
            gamemodes: {
              description: 'Stats in specific Arena gamemodes',
              type: 'object',
              properties: {
                one_v_one: {
                  description: 'Specific stats in 1v1 Arena',
                  type: 'object',
                  properties: {
                    damage: {
                      description: 'Total damage dealt in 1v1 Arena',
                      type: 'integer',
                    },
                    kills: {
                      description: 'Total kills in 1v1 Arena',
                      type: 'integer',
                    },
                    deaths: {
                      description: 'Total deaths in 1v1 Arena',
                      type: 'integer',
                    },
                    losses: {
                      description: 'Total losses in 1v1 Arena',
                      type: 'integer',
                    },
                    wins: {
                      description: 'Total wins in 1v1 Arena',
                      type: 'integer',
                    },
                    win_streaks: {
                      description: 'Highest win streak in 1v1 Arena',
                      type: 'integer',
                    },
                    games: {
                      description: 'Total games played in 1v1 Arena',
                      type: 'integer',
                    },
                    healed: {
                      description: 'Total health healed in 1v1 Arena',
                      type: 'integer',
                    },
                    kd: {
                      description: 'Kill/death ratio in 1v1 Arena',
                      type: 'number',
                    },
                    win_loss: {
                      description: 'Win/loss ratio in 1v1 Arena',
                      type: 'number',
                    },
                    win_percentage: {
                      description: 'Win percentage out of games played in 1v1 Arena',
                      type: 'number',
                    },
                  },
                },
                two_v_two: {
                  description: 'Specific stats in 2v2 Arena',
                  type: 'object',
                  properties: {
                    damage: {
                      description: 'Total damage dealt in 2v2 Arena',
                      type: 'integer',
                    },
                    kills: {
                      description: 'Total kills in 2v2 Arena',
                      type: 'integer',
                    },
                    deaths: {
                      description: 'Total deaths in 2v2 Arena',
                      type: 'integer',
                    },
                    losses: {
                      description: 'Total losses in 2v2 Arena',
                      type: 'integer',
                    },
                    wins: {
                      description: 'Total wins in 2v2 Arena',
                      type: 'integer',
                    },
                    win_streaks: {
                      description: 'Highest win streak in 2v2 Arena',
                      type: 'integer',
                    },
                    games: {
                      description: 'Total games played in 2v2 Arena',
                      type: 'integer',
                    },
                    healed: {
                      description: 'Total health healed in 2v2 Arena',
                      type: 'integer',
                    },
                    kd: {
                      description: 'Kill/death ratio in 2v2 Arena',
                      type: 'number',
                    },
                    win_loss: {
                      description: 'Win/loss ratio in 2v2 Arena',
                      type: 'number',
                    },
                    win_percentage: {
                      description: 'Win percentage out of games played in 2v2 Arena',
                      type: 'number',
                    },
                  },
                },
                four_v_four: {
                  description: 'Specific stats in 4v4 Arena',
                  type: 'object',
                  properties: {
                    damage: {
                      description: 'Total damage dealt in 4v4 Arena',
                      type: 'integer',
                    },
                    kills: {
                      description: 'Total kills in 4v4 Arena',
                      type: 'integer',
                    },
                    deaths: {
                      description: 'Total deaths in 4v4 Arena',
                      type: 'integer',
                    },
                    losses: {
                      description: 'Total losses in 4v4 Arena',
                      type: 'integer',
                    },
                    wins: {
                      description: 'Total wins in 4v4 Arena',
                      type: 'integer',
                    },
                    win_streaks: {
                      description: 'Highest win streak in 4v4 Arena',
                      type: 'integer',
                    },
                    games: {
                      description: 'Total games played in 4v4 Arena',
                      type: 'integer',
                    },
                    healed: {
                      description: 'Total health healed in 4v4 Arena',
                      type: 'integer',
                    },
                    kd: {
                      description: 'Kill/death ratio in 4v4 Arena',
                      type: 'number',
                    },
                    win_loss: {
                      description: 'Win/loss ratio in 4v4 Arena',
                      type: 'number',
                    },
                    win_percentage: {
                      description: 'Win percentage out of games played in 4v4 Arena',
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
        },
        Warlords: {
          description: 'Player stats in Warlords',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Warlords',
              type: 'integer',
            },
          },
        },
        BedWars: {
          description: 'Player stats in Bedwars',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Bedwars',
              type: 'integer',
            },
            exp: {
              description: 'Total exp',
              type: 'number',
            },
            level: {
              description: 'EXP level',
              type: 'integer',
            },
            wins: {
              description: 'Total exp',
              type: 'integer',
            },
            losses: {
              description: 'Total exp',
              type: 'integer',
            },
            games_played: {
              description: 'Total exp',
              type: 'integer',
            },
            kills: {
              description: 'Total exp',
              type: 'integer',
            },
            deaths: {
              description: 'Total number of deaths',
              type: 'integer',
            },
            k_d: {
              description: 'K/D ratio',
              type: 'number',
            },
            w_l: {
              description: 'W/L ratio',
              type: 'number',
            },
            beds_broken: {
              description: 'Total number of beds broken',
              type: 'integer',
            },
            beds_lost: {
              description: 'Total number of beds lost',
              type: 'integer',
            },
            bed_ratio: {
              description: 'Ratio of beds broken to beds lost',
              type: 'number',
            },
            final_kills: {
              description: 'Total number of final kills',
              type: 'integer',
            },
            final_deaths: {
              description: 'Total number of final deaths',
              type: 'integer',
            },
            final_k_d: {
              description: 'Total number of final deaths',
              type: 'number',
            },
            void_kills: {
              description: 'Total number of final deaths',
              type: 'integer',
            },
            void_deaths: {
              description: 'Total number of final deaths',
              type: 'integer',
            },
            winstreak: {
              description: 'Amount of times you\'ve gone without losing',
              type: 'integer',
            },
            boxes: {
              description: 'Stats for boxes in BedWars',
              type: 'object',
              properties: {
                current: {
                  description: 'Current amount of boxes',
                  type: 'integer',
                },
                opened: {
                  description: 'Amount of boxes opened',
                  type: 'integer',
                },
                commons: {
                  description: 'Amount of commons earned from boxes',
                  type: 'integer',
                },
                rares: {
                  description: 'Amount of rares earned from boxes',
                  type: 'integer',
                },
                epics: {
                  description: 'Amount of epics earned from boxes',
                  type: 'integer',
                },
                legendaries: {
                  description: 'Amount of legendaries earned from boxes',
                  type: 'integer',
                },
              },
            },
            resources_collected: {
              description: 'Stats for the resources collected in BedWars',
              type: 'object',
              properties: {
                iron: {
                  description: 'Total number of iron collected from generators',
                  type: 'integer',
                },
                gold: {
                  description: 'Total number of gold collected from generators',
                  type: 'integer',
                },
                diamond: {
                  description: 'Total number of diamonds collected from generators',
                  type: 'integer',
                },
                emerald: {
                  description: 'Total number of emeralds collected from generators',
                  type: 'integer',
                },
              },
            },
            gamemodes: {
              description: 'Stats for the different gamemodes in BedWars',
              type: 'object',
              properties: {},
            },
          },
        },
        BuildBattle: {
          description: 'Player stats in Build Battle',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Build Battle',
              type: 'integer',
            },
            score: {
              description: 'Current score in Build Battle',
              type: 'integer',
            },
            wins: {
              description: 'Wins in all Build Battle modes',
              type: 'integer',
            },
            w_r: {
              description: 'Win Ratio',
              type: 'integer',
            },
            total_votes: {
              description: 'Judging votes on other builds',
              type: 'integer',
            },
            wins_solo_normal: {
              description: 'Wins in Solo Mode',
              type: 'integer',
            },
            wins_solo_pro: {
              description: 'Wins in Pro Mode',
              type: 'integer',
            },
            wins_teams_normal: {
              description: 'Wins in Teams Mode',
              type: 'integer',
            },
            wins_guess_the_build: {
              description: 'Wins in Guess The Build',
              type: 'integer',
            },
            correct_guesses: {
              description: 'Correct guesses in Guess The Build',
              type: 'integer',
            },
            games_played: {
              description: 'Post-Update games played in all modes',
              type: 'integer',
            },
            super_votes: {
              description: 'Super Votes the player currently has',
              type: 'integer',
            },
            loadout: {
              description: 'Custom Hotbar loadout',
              type: 'array',
            },
            selected_hat: {
              description: 'Currently selected hat cosmetic',
              type: 'string',
            },
            selected_victory_dance: {
              description: 'Currently selected victory dance cosmetic',
              type: 'string',
            },
            selected_suit: {
              description: 'Currently selected suit cosmetic',
              type: 'string',
            },
            selected_movement_trail: {
              description: 'Currently selected movement trail cosmetic',
              type: 'string',
            },
            selected_backdrop: {
              description: 'Currently selected backdrop cosmetic',
              type: 'string',
            },
            themeRatings: {
              description: 'Key-Value pairs of 1-5 star ratings on themes',
              type: 'object',
            },
          },
        },
        Duels: {
          description: 'Player stats in Duels',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Duels',
              type: 'integer',
            },
          },
        },
        TKR: {
          description: 'Current stats in Turbo Kart Racers',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Turbo Kart Racers',
              type: 'integer',
            },
            coin_pickups: {
              description: 'Total coins picked up in Turbo Kart Racers',
              type: 'integer',
            },
            laps: {
              description: 'Total laps completed in Turbo Kart Racers',
              type: 'integer',
            },
            wins: {
              description: 'Total wins in Turbo Kart Racers',
              type: 'integer',
            },
            box_pickups: {
              description: 'Total powerups collected in Turbo Kart Racers',
              type: 'integer',
            },
            bananas_sent: {
              description: 'Total successful hits by your bananas in Turbo Kart Racers',
              type: 'integer',
            },
            bananas_received: {
              description: 'Total bananas slipped on in Turbo Kart Racers',
              type: 'integer',
            },
            banana_ratio: {
              description: 'Ratio of banana hits to bananas slipped on',
              type: 'number',
            },
            trophies: {
              description: 'Stats for trophies won in Turbo Kart Racers',
              type: 'object',
              properties: {
                gold: {
                  description: 'Total gold trophies (first place) won in Turbo Kart Racers',
                  type: 'integer',
                },
                silver: {
                  description: 'Total silver trophies (second place) won in Turbo Kart Racers',
                  type: 'integer',
                },
                bronze: {
                  description: 'Total bronze trophies (third place) won in Turbo Kart Racers',
                  type: 'integer',
                },
              },
            },
            maps: {
              description: 'Player stats on specific maps in Turbo Kart Racers',
              type: 'object',
              properties: {
                retro: {
                  description: 'Player stats on the Retro map in Turbo Kart Racers',
                  type: 'object',
                  properties: {
                    games: {
                      description: 'Total games played on Retro',
                      type: 'integer',
                    },
                    win_ratio: {
                      description: 'Ratio of wins to games played on Retro',
                      type: 'number',
                    },
                    trophies: {
                      description: 'Trophies won on Retro',
                      type: 'object',
                      properties: {
                        gold: {
                          description: 'Gold trophies won on Retro',
                          type: 'integer',
                        },
                        silver: {
                          description: 'Silver trophies won on Retro',
                          type: 'integer',
                        },
                        bronze: {
                          description: 'Bronze trophies won on Retro',
                          type: 'integer',
                        },
                      },
                    },
                  },
                },
                hypixelgp: {
                  description: 'Player stats on the Hypixel GP map in Turbo Kart Racers',
                  type: 'object',
                  properties: {
                    games: {
                      description: 'Total games played on Hypixel GP',
                      type: 'integer',
                    },
                    win_ratio: {
                      description: 'Ratio of wins to games played on Hypixel GP',
                      type: 'number',
                    },
                    trophies: {
                      description: 'Trophies won on Hypixel GP',
                      type: 'object',
                      properties: {
                        gold: {
                          description: 'Gold trophies won on Hypixel GP',
                          type: 'integer',
                        },
                        silver: {
                          description: 'Silver trophies won on Hypixel GP',
                          type: 'integer',
                        },
                        bronze: {
                          description: 'Bronze trophies won on Hypixel GP',
                          type: 'integer',
                        },
                      },
                    },
                  },
                },
                junglerush: {
                  description: 'Player stats on the Jungle Rush map in Turbo Kart Racers',
                  type: 'object',
                  properties: {
                    games: {
                      description: 'Total games played on Jungle Rush',
                      type: 'integer',
                    },
                    win_ratio: {
                      description: 'Ratio of wins to games played on Jungle Rush',
                      type: 'number',
                    },
                    trophies: {
                      description: 'Trophies won on Jungle Rush',
                      type: 'object',
                      properties: {
                        gold: {
                          description: 'Gold trophies won on Jungle Rush',
                          type: 'integer',
                        },
                        silver: {
                          description: 'Silver trophies won on Jungle Rush',
                          type: 'integer',
                        },
                        bronze: {
                          description: 'Bronze trophies won on Jungle Rush',
                          type: 'integer',
                        },
                      },
                    },
                  },
                },
                olympus: {
                  description: 'Player stats on the Olympus map in Turbo Kart Racers',
                  type: 'object',
                  properties: {
                    games: {
                      description: 'Total games played on Olympus',
                      type: 'integer',
                    },
                    win_ratio: {
                      description: 'Ratio of wins to games played on Olympus',
                      type: 'number',
                    },
                    trophies: {
                      description: 'Trophies won on Olympus',
                      type: 'object',
                      properties: {
                        gold: {
                          description: 'Gold trophies won on Olympus',
                          type: 'integer',
                        },
                        silver: {
                          description: 'Silver trophies won on Olympus',
                          type: 'integer',
                        },
                        bronze: {
                          description: 'Bronze trophies won on Olympus',
                          type: 'integer',
                        },
                      },
                    },
                  },
                },
                canyon: {
                  description: 'Player stats on the Canyon map in Turbo Kart Racers',
                  type: 'object',
                  properties: {
                    games: {
                      description: 'Total games played on Canyon',
                      type: 'integer',
                    },
                    win_ratio: {
                      description: 'Ratio of wins to games played on Canyon',
                      type: 'number',
                    },
                    trophies: {
                      description: 'Trophies won on Canyon',
                      type: 'object',
                      properties: {
                        gold: {
                          description: 'Gold trophies won on Canyon',
                          type: 'integer',
                        },
                        silver: {
                          description: 'Silver trophies won on Canyon',
                          type: 'integer',
                        },
                        bronze: {
                          description: 'Bronze trophies won on Canyon',
                          type: 'integer',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Blitz: {
          description: 'Player stats in Blitz Survival Games',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Blitz Survival Games',
              type: 'integer',
            },
            deaths: {
              description: 'Total deaths in Blitz Survival Games',
              type: 'integer',
            },
            kills: {
              description: 'Total kills in Blitz Survival Games',
              type: 'integer',
            },
            k_d: {
              description: 'Ratio of kills to deaths in Blitz Survival Games',
              type: 'number',
            },
            wins: {
              description: 'Total wins in Solo Blitz Survival Games',
              type: 'integer',
            },
            team_wins: {
              description: 'Total wins in Teams Blitz Survival Games',
              type: 'integer',
            },
            win_loss: {
              description: 'Ratio of total wins to losses in Blitz Survival Games',
              type: 'number',
            },
            win_percentage: {
              description: 'Percentage of games won out of total games played in Blitz Survival Games',
              type: 'integer',
            },
            weekly_kills: {
              description: 'Current weekly kills in Blitz Survival Games',
              type: 'integer',
            },
            monthly_kills: {
              description: 'Current monthly kills in Blitz Survival Games',
              type: 'integer',
            },
            rambo_wins: {
              description: 'Total games won with the Rambo kit in Blitz Survival Games',
              type: 'integer',
            },
            random_wins: {
              description: 'Total games won with a random kit in Blitz Survival Games',
              type: 'integer',
            },
            damage_taken: {
              description: 'Total damage taken in Blitz Survival Games',
              type: 'integer',
            },
            taunt_kills: {
              description: 'Total players killed while using a taunt in Blitz Survival Games',
              type: 'integer',
            },
            potions_drunk: {
              description: 'Total potions drunk in Blitz Survival Games',
              type: 'integer',
            },
            damage: {
              description: 'Total damage dealt in Blitz Survival Games',
              type: 'integer',
            },
            mobs_spawned: {
              description: 'Total mobs spawned by the player in Blitz Survival Games',
              type: 'integer',
            },
            time_played: {
              description: 'Total playtime in Blitz Survival Games',
              type: 'number',
            },
            arrows_hit: {
              description: 'Successful arrow shots landed in Blitz Survival Games',
              type: 'integer',
            },
            games_played: {
              description: 'Total games of Blitz Survival Games played',
              type: 'number',
            },
            potions_thrown: {
              description: 'Total splash potions thrown in Blitz Survival Games',
              type: 'integer',
            },
            arrows_fired: {
              description: 'Total arrows shot in blitz survival games',
              type: 'integer',
            },
            blitz_uses: {
              description: 'Total number of Blitz Stars used in Blitz Survival Games',
              type: 'integer',
            },
            chests_opened: {
              description: 'Total number of chests opened in Blitz Survival Games',
              type: 'integer',
            },
            kits_levels: {
              description: 'Player\'s current kit levels in Blitz Survival Games',
              type: 'object',
            },
            kit_stats: {
              description: 'Specific stats with a kit in Blitz Survival Games',
              type: 'object',
            },
            equipped: {
              description: 'Player\'s current cosmetics equipped in Blitz Survival Games',
              type: 'object',
              properties: {
                aura: {
                  description: 'Currently equipped aura cosmetic',
                  type: 'string',
                },
                taunt: {
                  description: 'Currently equipped taunt effect',
                  type: 'string',
                },
                victory_dance: {
                  description: 'Currently equipped victory dance effect',
                  type: 'string',
                },
                finisher: {
                  description: 'Currently equipped finisher effect',
                  type: 'string',
                },
              },
            },
            settings: {
              description: 'Current settings in Blitz Survival Games',
              type: 'object',
              properties: {
                default_kit: {
                  description: 'Current kit selected as default in Blitz Survival Games',
                  type: 'string',
                },
                auto_armor: {
                  description: 'Is auto armor enabled',
                  type: 'boolean',
                },
              },
            },
            inventories: {
              description: 'Currently configured kit inventories',
              type: 'object',
            },
          },
        },
        CvC: {
          description: 'Player stats in Cops vs Crims',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Cops vs Crims',
              type: 'integer',
            },
            deaths: {
              description: 'Total deaths in Cops vs Crims',
              type: 'integer',
            },
            kills: {
              description: 'Total kills in Cops vs Crims',
              type: 'integer',
            },
            kd: {
              description: 'Current kill/death ratio in Cops vs Crims',
              type: 'number',
            },
            wins: {
              description: 'Total wins in Cops vs Crims',
              type: 'integer',
            },
            cop_kills: {
              description: 'Total cops killed',
              type: 'integer',
            },
            criminal_kills: {
              description: 'Total criminals killed',
              type: 'integer',
            },
            weekly_kills: {
              description: 'Current weekly kills',
              type: 'integer',
            },
            monthly_kills: {
              description: 'Current monthly kills',
              type: 'integer',
            },
            bombs_planted: {
              description: 'Total bombs planted as Criminal',
              type: 'integer',
            },
            bombs_defused: {
              description: 'Total bombs defused as Cop',
              type: 'integer',
            },
            grenade_kills: {
              description: 'Total kills with a grenade',
              type: 'integer',
            },
            headshot_kills: {
              description: 'Total headshot kills',
              type: 'integer',
            },
            round_wins: {
              description: 'Total individual round wins',
              type: 'integer',
            },
            selected_lobby_prefix: {
              description: 'Currently selected nametag prefix in the Cops vs Crims lobby',
              type: 'string',
            },
            shots_fired: {
              description: 'Total shots fired',
              type: 'integer',
            },
            show_lobby_prefix: {
              description: 'Whether the lobby nametag prefix is currently enabled',
              type: 'boolean',
            },
            map_wins: {
              description: 'Current wins on specific maps',
              type: 'object',
              properties: {
                alleyway: {
                  description: 'Current wins on the Alleyway map',
                  type: 'integer',
                },
                atomic: {
                  description: 'Current wins on the Atomic map',
                  type: 'integer',
                },
                carrier: {
                  description: 'Current wins on the Carrier map',
                  type: 'integer',
                },
                melon_factory: {
                  description: 'Current wins on the Melon Factory map',
                  type: 'integer',
                },
                overgrown: {
                  description: 'Current wins on the Overgrown map',
                  type: 'integer',
                },
                reserve: {
                  description: 'Current wins on the Reserve map',
                  type: 'integer',
                },
                sandstorm: {
                  description: 'Current wins on the Sandstorm map',
                  type: 'integer',
                },
                temple: {
                  description: 'Current wins on the Temple map',
                  type: 'integer',
                },
              },
              deathmatch: {
                description: 'Current player stats in CvC Deathmatch',
                type: 'object',
                properties: {
                  kills: {
                    description: 'Total kills in CvC Deathmatch',
                    type: 'integer',
                  },
                  deaths: {
                    description: 'Total deaths in CvC Deathmatch',
                    type: 'integer',
                  },
                  kd: {
                    description: 'Current kill/death ratio in CvC Deathmatch',
                    type: 'number',
                  },
                  wins: {
                    description: 'Total wins in CvC Deathmatch',
                    type: 'integer',
                  },
                  cop_kills: {
                    description: 'Total cops killed in CvC Deathmatch',
                    type: 'integer',
                  },
                  criminal_kills: {
                    description: 'Total criminals killed in CvC Deathmatch',
                    type: 'integer',
                  },
                },
              },
              perks: {
                description: 'Currently purchased perks and upgrades for Cops vs Crims',
                type: 'object',
                properties: {
                  player: {
                    description: 'Character upgrades',
                    type: 'object',
                    properties: {
                      body_armor_cost: {
                        description: 'Current progression of Body Armor Cost upgrade',
                        type: 'integer',
                      },
                      bounty_hunter: {
                        description: 'Current progression of Bounty Hunter upgrade',
                        type: 'integer',
                      },
                      pocket_change: {
                        description: 'Current progression of Pocket Change upgrade',
                        type: 'integer',
                      },
                      strength_training: {
                        description: 'Current progression of Strength Training upgrade',
                        type: 'integer',
                      },
                    },
                  },
                  carbine: {
                    description: 'Carbine Specialization upgrades',
                    type: 'object',
                    properties: {
                      cost_reduction: {
                        description: 'Current progression of the Carbine\'s Cost Reduction upgrade',
                        type: 'integer',
                      },
                      damage_increase: {
                        description: 'Current progression of the Carbine\'s Damage Increase upgrade',
                        type: 'integer',
                      },
                      recoil_reduction: {
                        description: 'Current progression of the Carbine\'s Recoil Reduction upgrade',
                        type: 'integer',
                      },
                      reload_speed_reduction: {
                        description: 'Current progression of the Carbine\'s Reload Speed Reduction upgrade',
                        type: 'integer',
                      },
                    },
                  },
                  knife: {
                    description: 'Knife Specialization upgrades',
                    type: 'object',
                    properties: {
                      attack_delay: {
                        description: 'Current progression of the Knife\'s Attack Delay upgrade',
                        type: 'integer',
                      },
                      damage_increase: {
                        description: 'Current progression of the Knife\'s Damage Increase upgrade',
                        type: 'integer',
                      },
                    },
                  },
                  magnum: {
                    description: 'Magnum Specialization upgrades',
                    type: 'object',
                    properties: {
                      cost_reduction: {
                        description: 'Current progression of the Magnum\'s Cost Reduction upgrade',
                        type: 'integer',
                      },
                      damage_increase: {
                        description: 'Current progression of the Magnum\'s Damage Increase upgrade',
                        type: 'integer',
                      },
                      recoil_reduction: {
                        description: 'Current progression of the Magnum\'s Recoil Reduction upgrade',
                        type: 'integer',
                      },
                      reload_speed_reduction: {
                        description: 'Current progression of the Magnum\'s Reload Speed Reduction upgrade',
                        type: 'integer',
                      },
                    },
                  },
                  pistol: {
                    description: 'Pistol Specialization upgrades',
                    type: 'object',
                    properties: {
                      damage_increase: {
                        description: 'Current progression of the Pistol\'s Damage Increase upgrade',
                        type: 'integer',
                      },
                      recoil_reduction: {
                        description: 'Current progression of the Pistol\'s Recoil Reduction upgrade',
                        type: 'integer',
                      },
                      reload_speed_reduction: {
                        description: 'Current progression of the Pistol\'s Reload Speed Reduction upgrade',
                        type: 'integer',
                      },
                    },
                  },
                  rifle: {
                    description: 'Rifle Specialization upgrades',
                    type: 'object',
                    properties: {
                      cost_reduction: {
                        description: 'Current progression of the Rifle\'s Cost Reduction upgrade',
                        type: 'integer',
                      },
                      damage_increase: {
                        description: 'Current progression of the Rifle\'s Damage Increase upgrade',
                        type: 'integer',
                      },
                      recoil_reduction: {
                        description: 'Current progression of the Rifle\'s Recoil Reduction upgrade',
                        type: 'integer',
                      },
                      reload_speed_reduction: {
                        description: 'Current progression of the Rifle\'s Reload Speed Reduction upgrade',
                        type: 'integer',
                      },
                    },
                  },
                  shotgun: {
                    description: 'Shotgun Specialization upgrades',
                    type: 'object',
                    properties: {
                      cost_reduction: {
                        description: 'Current progression of the Shotgun\'s Cost Reduction upgrade',
                        type: 'integer',
                      },
                      damage_increase: {
                        description: 'Current progression of the Shotgun\'s Damage Increase upgrade',
                        type: 'integer',
                      },
                      recoil_reduction: {
                        description: 'Current progression of the Shotgun\'s Recoil Reduction upgrade',
                        type: 'integer',
                      },
                      reload_speed_reduction: {
                        description: 'Current progression of the Shotgun\'s Reload Speed Reduction upgrade',
                        type: 'integer',
                      },
                    },
                  },
                  smg: {
                    description: 'SMG Specialization upgrades',
                    type: 'object',
                    properties: {
                      cost_reduction: {
                        description: 'Current progression of the SMG\'s Cost Reduction upgrade',
                        type: 'integer',
                      },
                      damage_increase: {
                        description: 'Current progression of the SMG\'s Damage Increase upgrade',
                        type: 'integer',
                      },
                      recoil_reduction: {
                        description: 'Current progression of the SMG\'s Recoil Reduction upgrade',
                        type: 'integer',
                      },
                      reload_speed_reduction: {
                        description: 'Current progression of the SMG\'s Reload Speed Reduction upgrade',
                        type: 'integer',
                      },
                    },
                  },
                  sniper: {
                    description: 'Sniper Specialization upgrades',
                    type: 'object',
                    properties: {
                      charge_bonus: {
                        description: 'Current progression of the Sniper\'s Target Acquire upgrade',
                        type: 'integer',
                      },
                      cost_reduction: {
                        description: 'Current progression of the Sniper\'s Cost Reduction upgrade',
                        type: 'integer',
                      },
                      damage_increase: {
                        description: 'Current progression of the Sniper\'s Damage Increase upgrade',
                        type: 'integer',
                      },
                      reload_speed_reduction: {
                        description: 'Current progression of the Sniper\'s Reload Speed Reduction upgrade',
                        type: 'integer',
                      },
                    },
                  },
                },
              },
              selected_cosmetics: {
                description: 'Currently selected cosmetic appearance for each weapon type',
                type: 'object',
                properties: {
                  carbine: {
                    description: 'Currently selected Carbine cosmetic',
                    type: 'string',
                  },
                  knife: {
                    description: 'Currently selected Knife cosmetic',
                    type: 'string',
                  },
                  magnum: {
                    description: 'Currently selected Magnum cosmetic',
                    type: 'string',
                  },
                  pistol: {
                    description: 'Currently selected Pistol cosmetic',
                    type: 'string',
                  },
                  rifle: {
                    description: 'Currently selected Rifle cosmetic',
                    type: 'string',
                  },
                  shotgun: {
                    description: 'Currently selected Shotgun cosmetic',
                    type: 'string',
                  },
                  smg: {
                    description: 'Currently selected SMG cosmetic',
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        MurderMystery: {
          description: 'Player stats in Murder Mystery',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Murder Mystery',
              type: 'integer',
            },
          },
        },
      },
    },
  },
};

module.exports = {
  playerObject,
};
