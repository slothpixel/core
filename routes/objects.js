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
    name_history: {
      description: 'History of usernames the user has joined Hypixel with',
      type: 'array',
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
    voting: {
      description: 'Player voting data',
      type: 'object',
      properties: {
        votes_today: {
          description: 'Votes in the last day',
          type: 'integer',
        },
        total_votes: {
          description: 'Total lifetime votes',
          type: 'integer',
        },
        last_vote: {
          description: 'Date of latest vote',
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
                  description: 'The Amount of arrows shot in Mini Walls',
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
                  type: 'string',
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
                  description: 'The Amount of shots fired in Galaxy Wars',
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
              description: 'Current Amount of Magical Chest keys',
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
            kills: {
              description: 'Current kills in Warlords',
              type: 'integer',
            },
            assists: {
              description: 'Current assists in Warlords',
              type: 'integer',
            },
            deaths: {
              description: 'Current deaths in Warlords',
              type: 'integer',
            },
            kill_death_ratio: {
              description: 'The players current kill/death in Warlords',
              type: 'integer',
            },
            wins: {
              description: 'Current wins in Warlords',
              type: 'integer',
            },
            wins_capturetheflag: {
              description: 'Current Capture the Flag wins in Warlords',
              type: 'integer',
            },
            wins_domination: {
              description: 'Current Domination wins in Warlords',
              type: 'integer',
            },
            wins_teamdeathmatch: {
              description: 'Current Team Deathmatch wins in Warlords',
              type: 'integer',
            },
            weapons_repaired: {
              description: 'Current number of weapons repaired in Warlords',
              type: 'integer',
            },
            flags_captured: {
              description: 'Current number of flags captured in Warlords',
              type: 'integer',
            },
            flags_returned: {
              description: 'Current number of flags returned in Warlords',
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
              description: 'Total Amount of deaths',
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
              description: 'Total Amount of beds broken',
              type: 'integer',
            },
            beds_lost: {
              description: 'Total Amount of beds lost',
              type: 'integer',
            },
            bed_ratio: {
              description: 'Ratio of beds broken to beds lost',
              type: 'number',
            },
            final_kills: {
              description: 'Total Amount of final kills',
              type: 'integer',
            },
            final_deaths: {
              description: 'Total Amount of final deaths',
              type: 'integer',
            },
            final_k_d: {
              description: 'Total Amount of final deaths',
              type: 'number',
            },
            void_kills: {
              description: 'Total Amount of final deaths',
              type: 'integer',
            },
            void_deaths: {
              description: 'Total Amount of final deaths',
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
                  description: 'Total Amount of iron collected from generators',
                  type: 'integer',
                },
                gold: {
                  description: 'Total Amount of gold collected from generators',
                  type: 'integer',
                },
                diamond: {
                  description: 'Total Amount of diamonds collected from generators',
                  type: 'integer',
                },
                emerald: {
                  description: 'Total Amount of emeralds collected from generators',
                  type: 'integer',
                },
              },
            },
            gamemodes: {
              description: 'Stats for the different gamemodes in BedWars',
              type: 'object',
              properties: {},
            },
            practice: {
              description: 'Stats for the Bed Wars Practice mode',
              type: 'object',
              properties: {
                selected: {
                  description: 'Selected Practice mode at the NPC',
                  type: 'string',
                },
                bridging: {
                  description: 'Statistics for the Bridging Practice mode',
                  type: 'object',
                  properties: {},
                },
                records: {
                  description: 'Bed Wars Practice records',
                  type: 'object',
                  properties: {},
                },
                mlg: {
                  description: 'Statistics for the MLG Practice mode',
                  type: 'object',
                  properties: {},
                },
                fireball_jumping: {
                  description: 'Statistics for the Fireball and TNT Jumping Practice mode',
                  type: 'object',
                  properties: {},
                },
              },
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
              items: {
                description: 'Hotbar slot loadout',
                type: 'string',
              },
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
            wins: {
              description: 'Total wins in Duels',
              type: 'integer',
            },
            losses: {
              description: 'Total losses in Duels',
              type: 'integer',
            },
            kills: {
              description: 'Total kills in Duels',
              type: 'integer',
            },
            deaths: {
              description: 'Total deaths in Duels',
              type: 'integer',
            },
            kd_ratio: {
              description: 'Ratio of kills to deaths',
              type: 'number',
            },
            win_loss_ratio: {
              description: 'Ratio of wins to losses',
              type: 'number',
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
              description: 'Total Amount of Blitz Stars used in Blitz Survival Games',
              type: 'integer',
            },
            chests_opened: {
              description: 'Total Amount of chests opened in Blitz Survival Games',
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
        MurderMystery: {
          description: 'Player stats in Murder Mystery',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Murder Mystery',
              type: 'integer',
            },
            wins: {
              description: 'Current wins in Murder Mystery',
              type: 'integer',
            },
            games_played: {
              description: 'Current games played in Murder Mystery',
              type: 'integer',
            },
            win_loss_ratio: {
              description: 'Current win/loss ratio in Murder Mystery. Dying as innocent, murderer, or detective (or in assassins) counts as a loss.',
              type: 'integer',
            },
            kills: {
              description: 'Current kills in Murder Mystery',
              type: 'integer',
            },
            deaths: {
              description: 'Current deaths in Murder Mystery',
              type: 'integer',
            },
            kill_death_ratio: {
              description: 'Current kill/death ratio in Murder Mystery',
              type: 'integer',
            },
            times_hero: {
              description: 'Number of times the player was the hero (killed the murderer without being detective) in Murder Mystery',
              type: 'integer',
            },
            boxes: {
              description: 'Stats for loot crates in Murder Mystery',
              type: 'object',
              properties: {
                current: {
                  description: 'Current amount of loot crates',
                  type: 'integer',
                },
                opened: {
                  description: 'Amount of loot crates opened',
                  type: 'integer',
                },
                commons: {
                  description: 'Amount of commons earned from loot crates',
                  type: 'integer',
                },
                rares: {
                  description: 'Amount of rares earned from loot crates',
                  type: 'integer',
                },
                epics: {
                  description: 'Amount of epics earned from loot crates',
                  type: 'integer',
                },
                legendaries: {
                  description: 'Amount of legendaries earned from loot crates',
                  type: 'integer',
                },
              },
            },
          },
        },
        Pit: {
          description: 'Player stats in The Pit',
          type: 'object',
          properties: {
            profile: {
              description: 'All player data like inventory',
              type: 'object',
              properties: {
                outgoing_offers: {
                  type: 'array',
                },
                contract_choices: {
                  type: 'array',
                },
                last_save: {
                  type: 'integer',
                  description: 'Unix timestamp when their stats were last saved',
                },
                hat_color: {
                  type: 'integer',
                  description: 'Decimal representation of their hat color',
                },
                trade_timestamps: {
                  type: 'array',
                  description: 'Aray of Unix timestamps of their recent trades',
                  items: {
                    type: 'integer',
                  },
                },
                impatient_enabled: {
                  type: 'boolean',
                },
                inv_enderchest: {
                  type: 'object',
                  description: 'Enderchest data',
                  properties: {
                    type: {
                      type: 'integer',
                    },
                    data: {
                      type: 'array',
                      description: 'Gzipped byte array of their enderchest inventory NBT data',
                      items: {
                        type: 'integer',
                      },
                    },
                  },
                },
                inv_contents: {
                  type: 'object',
                  description: 'Inventory data',
                  properties: {
                    type: {
                      type: 'integer',
                    },
                    data: {
                      type: 'array',
                      description: 'Gzipped byte array of their inventory NBT data',
                      items: {
                        type: 'integer',
                      },
                    },
                  },
                },
                inv_armor: {
                  type: 'object',
                  description: 'Armor data',
                  properties: {
                    type: {
                      type: 'integer',
                    },
                    data: {
                      type: 'array',
                      description: 'Gzipped byte array of their armor inventory NBT data',
                      items: {
                        type: 'integer',
                      },
                    },
                  },
                },
                item_stash: {
                  type: 'object',
                  description: 'Item stash data',
                  properties: {
                    type: {
                      type: 'integer',
                    },
                    data: {
                      type: 'array',
                      description: 'Gzipped byte array of their stash inventory NBT data',
                      items: {
                        type: 'integer',
                      },
                    },
                  },
                },
                mystic_well_item: {
                  type: 'object',
                  description: 'Mystic well item data',
                  properties: {
                    type: {
                      type: 'integer',
                    },
                    data: {
                      type: 'array',
                      description: 'Gzipped byte array of their mystic well item\'s NBT data',
                      items: {
                        type: 'integer',
                      },
                    },
                  },
                },
                mystic_well_pants: {
                  type: 'object',
                  description: 'Mystic well pants data',
                  properties: {
                    type: {
                      type: 'integer',
                    },
                    data: {
                      type: 'array',
                      description: 'Gzipped byte array of their mystic well pant\'s NBT data',
                      items: {
                        type: 'integer',
                      },
                    },
                  },
                },
                death_recaps: {
                  type: 'object',
                  description: 'Death Recaps data',
                  properties: {
                    type: {
                      type: 'integer',
                    },
                    data: {
                      type: 'array',
                      description: 'Gzipped byte array of their death recap book',
                      items: {
                        type: 'integer',
                      },
                    },
                  },
                },
                cash: {
                  type: 'number',
                  description: 'Current Gold',
                },
                leaderboard_stats: {
                  type: 'object',
                  description: 'Seasonal scores for event leaderboards',
                },
                genesis_spawn_in_base: {
                  type: 'boolean',
                },
                selected_perk_0: {
                  type: 'string',
                  description: 'Perk key for their first slot',
                },
                selected_perk_1: {
                  type: 'string',
                  description: 'Perk key for their second slot',
                },
                selected_perk_2: {
                  type: 'string',
                  description: 'Perk key for their third slot',
                },
                selected_perk_3: {
                  type: 'string',
                  description: 'Perk key for their fourth slot',
                },
                last_contract: {
                  type: 'integer',
                },
                ended_contracts: {
                  type: 'array',
                  description: 'Recently completed contracts',
                  items: {
                    type: 'object',
                    properties: {
                      difficulty: {
                        type: 'string',
                      },
                      gold_reward: {
                        type: 'integer',
                      },
                      requirements: {
                        type: 'object',
                      },
                      progress: {
                        type: 'object',
                      },
                      chunk_of_viles_reward: {
                        type: 'integer',
                      },
                      completion_date: {
                        type: 'integer',
                      },
                      remaining_ticks: {
                        type: 'integer',
                      },
                      key: {
                        type: 'string',
                      },
                    },
                  },
                },
                gold_transactions: {
                  type: 'array',
                  description: 'Array of recent trades made',
                  items: {
                    type: 'object',
                    properties: {
                      amount: {
                        type: 'integer',
                        description: 'Amount of gold traded',
                      },
                      timestamp: {
                        type: 'integer',
                        description: 'Unix timestamp of the trade',
                      },
                    },
                  },
                },
                renown: {
                  type: 'integer',
                  description: 'Current renown',
                },
                hat_enabled: {
                  type: 'boolean',
                },
                genesis_points: {
                  type: 'integer',
                },
                drop_confirm_disabled: {
                  type: 'boolean',
                },
                prestiges: {
                  type: 'array',
                  description: 'Details on each prestige',
                  items: {
                    type: 'object',
                    properties: {
                      index: {
                        type: 'integer',
                        description: 'The prestige they are moving to',
                      },
                      xp_on_prestige: {
                        type: 'integer',
                        description: 'Useful for calculating level',
                      },
                      timestamp: {
                        type: 'integer',
                        description: 'Unix timestamp of the prestige',
                      },
                    },
                  },
                },
                zero_point_three_gold_transfer: {
                  type: 'boolean',
                },
                renown_unlocks: {
                  description: 'Renown shop upgrades',
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      tier: {
                        type: 'integer',
                        description: 'Tier of the unlock indexed from 0',
                      },
                      acquireDate: {
                        type: 'integer',
                        description: 'Unix timestamp of unlock',
                      },
                      key: {
                        type: 'string',
                        description: 'Name of the unlock',
                      },
                    },
                  },
                },
                selected_launch_trail: {
                  type: 'string',
                },
                selected_leaderboard: {
                  type: 'string',
                },
                last_midfight_disconnect: {
                  type: 'integer',
                },
                genesis_allegiance_time: {
                  type: 'integer',
                  description: 'Timestamp of last pledge to a faction',
                },
                genesis_weekly_perks_claim_item_demon: {
                  type: 'integer',
                },
                login_messages: {
                  type: 'array',
                },
                hotbar_favorites: {
                  type: 'array',
                  description: 'Item ids for perfered slots of items',
                  items: {
                    type: 'number',
                  },
                },
                reconessence_day: {
                  type: 'integer',
                  description: 'Timestamp of the last time the player used recon essence',
                },
                chat_option_player_chat: {
                  type: 'boolean',
                },
                chat_option_misc: {
                  type: 'boolean',
                },
                chat_option_bounties: {
                  type: 'boolean',
                },
                chat_option_prestige_announcements: {
                  type: 'boolean',
                },
                chat_option_streaks: {
                  type: 'boolean',
                },
                chat_option_kill_feed: {
                  type: 'boolean',
                },
                apollo_enabled: {
                  type: 'boolean',
                },
                zero_point_two_xp: {
                  type: 'integer',
                  description: 'XP earned before update prestige update',
                },
                last_lycanthropy: {
                  type: 'integer',
                  description: 'Timestamp',
                },
                recent_kills: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      victim: {
                        type: 'string',
                        description: 'Victim\'s uuid',
                      },
                      timestamp: {
                        type: 'integer',
                      },
                    },
                  },
                },
                xp: {
                  type: 'integer',
                },
                bounties: {
                  type: 'array',
                  description: 'Array used to contruct their current bounty',
                  items: {
                    type: 'object',
                    description: 'A bounty bump',
                    properties: {
                      amount: {
                        type: 'integer',
                        description: 'Amount of gold added this bump',
                      },
                      timestamp: {
                        type: 'integer',
                      },
                      remainingTicks: {
                        type: 'integer',
                        description: 'Usless artifact of borrowed code',
                      },
                      issuer: {
                        type: 'string',
                        description: 'Usless artifact of borrowed code',
                      },
                    },
                  },
                },
                night_quests_enabled: {
                  type: 'boolean',
                },
                genesis_allegiance: {
                  type: 'string',
                  description: 'Genesis map faction either "DEMON" or "ANGEL"',
                },
                cash_during_prestige_0: {
                  type: 'number',
                  description: 'Gold earned during prestige 0',
                },
                cash_during_prestige_1: {
                  type: 'number',
                  description: 'Gold earned during prestige 1',
                },
                unlocks: {
                  description: 'Perks / Upgrades unlocked during prestige 0',
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      tier: {
                        type: 'integer',
                        description: 'Tier of the upgrade indexed from 0',
                      },
                      acquireDate: {
                        type: 'integer',
                        description: 'Unix timestamp of unlock',
                      },
                      key: {
                        type: 'string',
                        description: 'Name of the upgrade',
                      },
                    },
                  },
                },
                unlocks_1: {
                  description: 'Perks / Upgrades unlocked during prestige 1',
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      tier: {
                        type: 'integer',
                        description: 'Tier of the upgrade indexed from 0',
                      },
                      acquireDate: {
                        type: 'integer',
                        description: 'Unix timestamp of unlock',
                      },
                      key: {
                        type: 'string',
                        description: 'Name of the upgrade',
                      },
                    },
                  },
                },
              },
            },
            stats_move_1: {
              type: 'integer',
              description: 'Unix timestamp of stats being imported if they played before 0.3.5',
            },
            restored_inv_backup_1: {
              type: 'integer',
              description: 'Timestamp of admin inventory restoration',
            },
            pit_stats_ptl: {
              description: 'All common player stats',
              type: 'object',
              properties: {
                gapple_eaten: {
                  description: 'Amount of golden apples eaten',
                  type: 'integer',
                },
                enderchest_opened: {
                  description: 'Times the player has opened their enderchest',
                  type: 'integer',
                },
                fishing_rod_launched: {
                  description: 'Times they have cast a fishing rod',
                  type: 'integer',
                },
                blocks_placed: {
                  description: 'Amount of blocks placed',
                  type: 'integer',
                },
                cash_earned: {
                  description: 'Lifetime gold earned',
                  type: 'integer',
                },
                launched_by_launchers: {
                  description: 'Times the player has been launched by a launcher',
                  type: 'integer',
                },
                arrows_fired: {
                  description: 'Amount of arrows fired',
                  type: 'integer',
                },
                enchanted_tier2: {
                  description: 'Amount of mystics the player has enchanted to tier two',
                  type: 'integer',
                },
                playtime_minutes: {
                  description: 'Player\'s playtime in minutes',
                  type: 'integer',
                },
                enchanted_tier1: {
                  description: 'Amount of mystics the player has enchanted to tier one',
                  type: 'integer',
                },
                chat_messages: {
                  description: 'Amount of chat messages sent in the pit',
                  type: 'integer',
                },
                bow_damage_received: {
                  description: 'Bow damage recieved',
                  type: 'integer',
                },
                enchanted_tier3: {
                  description: 'Amount of mystics the player has enchanted to tier three',
                  type: 'integer',
                },
                kills: {
                  description: 'Player\'s kills',
                  type: 'integer',
                },
                diamond_items_purchased: {
                  description: 'Amount of diamond items purchased',
                  type: 'integer',
                },
                deaths: {
                  description: 'Amount of deaths',
                  type: 'integer',
                },
                soups_drank: {
                  description: 'Amount of soups drank',
                  type: 'integer',
                },
                ghead_eaten: {
                  description: 'Amount of golden heads eaten',
                  type: 'integer',
                },
                sword_hits: {
                  description: 'Times the player has hit another player with a sword',
                  type: 'integer',
                },
                joins: {
                  description: 'Times the player has joined the Pit',
                  type: 'integer',
                },
                bow_damage_dealt: {
                  description: 'Total damage dealt via bow',
                  type: 'integer',
                },
                contracts_started: {
                  description: 'Amount of contracts initiated',
                  type: 'integer',
                },
                damage_received: {
                  description: 'Total amount of damage received',
                  type: 'integer',
                },
                jumped_into_pit: {
                  description: 'Amount of the time a player has jumped into mid',
                  type: 'integer',
                },
                melee_damage_received: {
                  description: 'Total damage received via melee',
                  type: 'integer',
                },
                left_clicks: {
                  description: 'Amount of left clicks performed',
                  type: 'integer',
                },
                arrow_hits: {
                  description: 'Amount of arrow hits',
                  type: 'integer',
                },
                damage_dealt: {
                  description: 'Total damage dealt',
                  type: 'integer',
                },
                assists: {
                  description: 'Amount of assists',
                  type: 'integer',
                },
                lava_bucket_emptied: {
                  description: 'Amount of lava buckets emptied',
                  type: 'integer',
                },
                max_streak: {
                  description: 'Highest streak ever reached',
                  type: 'integer',
                },
                sewer_treasures_found: {
                  description: 'Amount of sewer treasures found',
                  type: 'integer',
                },
                night_quests_completed: {
                  description: 'Amount of night quests completed',
                  type: 'integer',
                },
                wheat_farmed: {
                  description: 'Amount of wheat farmed',
                  type: 'integer',
                },
                dark_pants_crated: {
                  description: 'Amount of dark pants created by the player',
                  type: 'integer',
                },
                dark_pants_t2: {
                  description: 'Amount of dark pants enchanted to tier two',
                  type: 'integer',
                },
                hidden_jewel_triggers: {
                  description: 'Amount of hidden jewels triggered by the player',
                  type: 'integer',
                },
                king_quest_completion: {
                  description: 'Amount of kings quests completed',
                  type: 'integer',
                },
                gold_from_farming: {
                  description: 'Amount of hay bales sold to npcs',
                  type: 'integer',
                },
                fished_anything: {
                  description: 'Times the player has fished anything not just fish',
                  type: 'integer',
                },
                fishes_fished: {
                  description: 'Times the player has fished just fish',
                  type: 'integer',
                },
                gold_from_selling_fish: {
                  description: 'Amount of fish sold to npcs',
                  type: 'integer',
                },
              },
            },
          },
        },
        Smash: {
          description: 'Player stats in Smash Heroes',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Smash Heroes',
              type: 'integer',
            },
            kills: {
              description: 'Amount of kills in Smash Heroes',
              type: 'integer',
            },
            deaths: {
              description: 'Amount of deaths in Smash Heroes',
              type: 'integer',
            },
            smash_level: {
              description: 'Player\'s Smash Level',
              type: 'integer',
            },
            kd: {
              description: 'Current kill/death ratio in Smash Heroes',
              type: 'number',
            },
            wins: {
              description: 'Amount of wins in Smash Heroes',
              type: 'integer',
            },
            losses: {
              description: 'Amount of losses in Smash Heroes',
              type: 'integer',
            },
            quits: {
              description: 'Number of times the player has left mid-game in Smash Heroes',
              type: 'integer',
            },
            win_streak: {
              description: 'Current consecutive wins in Smash Heroes',
              type: 'integer',
            },
            wl: {
              description: 'Current win/loss ratio in Smash Heroes',
              type: 'number',
            },
            games_played: {
              description: 'Total number of Smash Heroes games played',
              type: 'integer',
            },
            weekly_kills: {
              description: 'Current weekly kills in Smash Heroes',
              type: 'integer',
            },
            weekly_wins: {
              description: 'Current weekly wins in Smash Heroes',
              type: 'integer',
            },
            weekly_losses: {
              description: 'Current weekly losses in Smash Heroes',
              type: 'integer',
            },
            weekly_games_played: {
              description: 'Smash Heroes games played this week',
              type: 'integer',
            },
            monthly_kills: {
              description: 'Current monthly kills in Smash Heroes',
              type: 'integer',
            },
            monthly_wins: {
              description: 'Current monthly wins in Smash Heroes',
              type: 'integer',
            },
            monthly_losses: {
              description: 'Current monthly losses in Smash Heroes',
              type: 'integer',
            },
            monthly_games_played: {
              description: 'Smash Heroes games played this month',
              type: 'integer',
            },
          },
        },
        SkyWars: {
          description: 'Player stats in SkyWars',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in SkyWars',
              type: 'integer',
            },
            wins: {
              description: 'Total wins in SkyWars',
              type: 'integer',
            },
            losses: {
              description: 'Total losses in SkyWars',
              type: 'integer',
            },
            win_loss_ratio: {
              description: 'Current win/loss ratio in SkyWars',
              type: 'integer',
            },
            skywars_experience: {
              description: 'Current experience in SkyWars',
              type: 'integer',
            },
            level: {
              description: 'Current level in SkyWars',
              type: 'integer',
            },
            kills: {
              description: 'Current kills in SkyWars',
              type: 'integer',
            },
            deaths: {
              description: 'Current deaths in SkyWars',
              type: 'integer',
            },
            assists: {
              description: 'Current assists in SkyWars',
              type: 'integer',
            },
            kill_death_ratio: {
              description: 'Current kill/death ratio in SkyWars',
              type: 'integer',
            },
            souls_gathered: {
              description: 'Total souls gathered in SkyWars',
              type: 'integer',
            },
            souls: {
              description: 'Current souls in the soul well in SkyWars',
              type: 'integer',
            },
            arrows_shot: {
              description: 'Total arrows shot in SkyWars',
              type: 'integer',
            },
            arrows_hit: {
              description: 'Total arrows hit in SkyWars',
              type: 'integer',
            },
            arrow_hit_miss_ratio: {
              description: 'Current arrow hit/miss ratio in SkyWars',
              type: 'integer',
            },
            eggs_thrown: {
              description: 'Total eggs thrown in SkyWars',
              type: 'integer',
            },
            enderpearls_thrown: {
              description: 'Total enderpearls thrown in SkyWars',
              type: 'integer',
            },
            blocks_placed: {
              description: 'Totla blocks placed in SkyWars',
              type: 'integer',
            },
            blocks_broken: {
              description: 'Current blocks broken in SkyWars',
              type: 'integer',
            },
            soul_well_uses: {
              description: 'Current soul well uses in SkyWars',
              type: 'integer',
            },
            soul_well_rares: {
              description: 'Number of rares a player has gotten from the soul well in SkyWars',
              type: 'integer',
            },
            soul_well_legendaries: {
              description: 'Number of legendaries a player has gotten from the soul well in SkyWars',
              type: 'integer',
            },
          },
        },
        TNT: {
          description: 'Player stats in the TNT Games',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in the TNT Games',
              type: 'integer',
            },
            gamemodes: {
              description: 'Stats for specific gamemodes in the TNT Games',
              type: 'object',
              properties: {
                tnt_run: {
                  description: 'Stats for TNT Run',
                  type: 'object',
                  properties: {
                    wins: {
                      description: 'Total wins in TNT Run',
                      type: 'integer',
                    },
                    losses: {
                      description: 'Total losses in TNT Run',
                      type: 'integer',
                    },
                    win_loss_ratio: {
                      description: 'The players win/loss ratio in TNT Run',
                      type: 'integer',
                    },
                    record_time_survived: {
                      description: 'The players record for longest time survived in TNT Run in seconds',
                      type: 'integer',
                    },
                  },
                },
                pvp_run: {
                  description: 'Stats for PVP Run',
                  type: 'object',
                  properties: {
                    wins: {
                      description: 'Total wins in PvP Run',
                      type: 'integer',
                    },
                    losses: {
                      description: 'Total losses in PvP Run',
                      type: 'integer',
                    },
                    win_loss_ratio: {
                      description: 'The players win/loss ratio in PvP Run',
                      type: 'integer',
                    },
                    kills: {
                      description: 'Total kills in PvP Runs',
                      type: 'integer',
                    },
                    record_time_survived: {
                      description: 'The players record for longest time survived in PvP Run in seconds',
                      type: 'integer',
                    },
                  },
                },
                tnt_tag: {
                  description: 'Stats for TNT Tag',
                  type: 'object',
                  properties: {
                    kills: {
                      description: 'Total kills in TNT Tag',
                      type: 'integer',
                    },
                    wins: {
                      description: 'Total wins in TNT Tag',
                      type: 'integer',
                    },
                  },
                },
                bow_spleef: {
                  description: 'Stats for Bowspleef',
                  type: 'object',
                  properties: {
                    wins: {
                      description: 'Total wins in Bowspleef',
                      type: 'integer',
                    },
                    losses: {
                      description: 'Total losses in Bowspleef',
                      type: 'integer',
                    },
                    win_loss_ratio: {
                      description: 'The players win/loss ratio in Bowspleef',
                      type: 'integer',
                    },
                  },
                },
                wizards: {
                  description: 'Stats for Wizards',
                  type: 'object',
                  properties: {
                    wins: {
                      description: 'Total wins in Wizards',
                      type: 'integer',
                    },
                    kills: {
                      description: 'Total kills in Wizards',
                      type: 'integer',
                    },
                    deaths: {
                      description: 'Total deaths in Wizards',
                      type: 'integer',
                    },
                    assists: {
                      description: 'Total assists in Wizards',
                      type: 'integer',
                    },
                    kill_death_ratio: {
                      description: 'The players kill/death ratio in Wizards',
                      type: 'integer',
                    },
                  },
                },
              },
            },
          },
        },
        MegaWalls: {
          description: 'Player stats in Mega Walls',
          type: 'object',
          properties: {
            coins: {
              description: 'Current coins in Mega Walls',
              type: 'integer',
            },
            kills: {
              description: 'Current kills in Mega Walls',
              type: 'integer',
            },
            assists: {
              description: 'Current assists in Mega Walls',
              type: 'integer',
            },
            deaths: {
              description: 'Current deaths in Mega Walls',
              type: 'integer',
            },
            kill_death_ratio: {
              description: 'Current kill/death ratio in Mega Walls',
              type: 'integer',
            },
            final_kills: {
              description: 'Current final kills in Mega Walls',
              type: 'integer',
            },
            final_assists: {
              description: 'Current final assists in Mega Walls',
              type: 'integer',
            },
            final_deaths: {
              description: 'Current final deaths in Mega Walls',
              type: 'integer',
            },
            final_kill_death_ratio: {
              description: 'Current final kill/death ratio in Mega Walls',
              type: 'integer',
            },
            wins: {
              description: 'Current wins in Mega Walls',
              type: 'integer',
            },
            losses: {
              description: 'Current losses in Mega Walls',
              type: 'integer',
            },
            win_loss_ratio: {
              description: 'Current win/loss ratio in Mega Walls',
              type: 'integer',
            },
            wither_damage: {
              description: 'The amount of damage the player has done to Withers in Mega Walls',
              type: 'integer',
            },
            defending_kills: {
              description: 'The number of kills the player has gotten while defending their wither in Mega Walls',
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
