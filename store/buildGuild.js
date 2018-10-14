/* eslint-disable consistent-return */
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const { game_types: gameTypes } = require('hypixelconstants');
const config = require('../config');
const processGuildData = require('../processors/processGuildData');
const utility = require('../util/utility');
const redis = require('../store/redis');
const queries = require('../store/queries');

/**
 * Scrapes the guild medals from the Hypixel forums
 * for the specified guild
 */
function getGuildMedals(id, cb) {
  const medals = {
    general: {},
    games: {},
  };

  cloudscraper.get(`https://hypixel.net/guilds/${id}`, (err, _, body) => {
    if (err) return cb(err);

    const $ = cheerio.load(body);

    $('.guild-medal').each(function() {
      const elem = $(this);
      const text = elem.parent().last().text();

      if (elem.hasClass('overall')) {
        const level = /Guild Level (\d+)/g.exec(text);
        const rank = /Guild Rank (\d+)/g.exec(text);

        medals.general.level = (level && level[1]) || 0;
        medals.general.rank = (rank && rank[1]) || 0;
      } else if (elem.hasClass('legacy-ranking')) {
        const legacy = /Legacy Rank (\d+)/g.exec(text);
        medals.general.legacy = (legacy && legacy[1]) || 0;
      } else {
        for (let i = 0; i < gameTypes.length; i += 1) {
          const game = gameTypes[i];

          // Search for any of the four game names in the 
          // html element text
          const names = Object.values(game)
            .filter(v => typeof v === 'string')
            .join('|');

          const re = new RegExp(`^(?:${names}) .+ (\\d+)`, 'i');
          const match = re.exec(text.replace('The', '').trim());

          if (match) {
            medals.games[game.standard_name] = match[1]; // eslint-disable-line
            break;
          }
        }
      }
    });

    cb(null, medals);
  });
}

/*
* Functions to build/cache guild object
* Currently doesn't support search by name
 */
function getGuildData(id, cb) {
  const { url } = utility.generateJob('guild', {
    id,
  });
  utility.getData(url, (err, body) => {
    if (err) return cb(err);

    getGuildMedals(id, (err, medals) => {
      if (err) return cb(err);

      cb(null, {
        ...processGuildData(body.guild),
        medals,
      });
    });
  });
}

function getGuildID(uuid, cb) {
  const { url } = utility.generateJob('findguild', {
    id: uuid,
  });
  utility.getData(url, (err, foundguild) => {
    if (err) return cb(err);
    return cb(null, foundguild.guild);
  });
}

function cacheGuild(guild, id, key, cb) {
  if (config.ENABLE_GUILD_CACHE) {
    redis.setex(key, config.GUILD_CACHE_SECONDS, JSON.stringify(guild), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  if (config.ENABLE_DB_CACHE) {
    queries.insertGuild(id, guild, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
  
  cb(guild);
}

function buildGuild(uuid, cb) {
  getGuildID(uuid, (err, id) => {
    if (err) {
      return cb(err);
    }
    if (id === null) {
      return cb(null);
    }
    const key = `guild:${id}`;
    redis.get(key, (err, reply) => {
      if (err) {
        return cb(err);
      }

      if (reply) {
        const guild = JSON.parse(reply);
        return cb(null, guild);
      }

      getGuildData(id, (err, guild) => {
        if (err) return cb(err);
        cacheGuild(guild, id, key, guild => cb(null, guild));
      });
    });
  });
}

module.exports = buildGuild;
