/* eslint-disable consistent-return */
const config = require('../config');
const {
  logger, generateJob, getData, typeToStandardName,
} = require('../util/utility');
const redis = require('../store/redis');

/*
* Functions to build/cache session objects
 */
function getSessionData(uuid, cb) {
  const { url } = generateJob('session', {
    id: uuid,
  });
  getData(url, (err, body) => {
    if (err) {
      return cb(err, null);
    }
    const { session } = body;
    const obj = session === null
      ? null
      : {
        game: typeToStandardName(session.gameType),
        server: session.server,
        players: session.players || [],
      };
    return cb(null, obj);
  });
}

function buildSession(uuid, cb) {
  const key = `session:${uuid}`;
  redis.get(key, (err, reply) => {
    if (err) {
      return cb(err);
    } if (reply) {
      const session = JSON.parse(reply);
      return cb(null, session);
    }
    getSessionData(uuid, (err, session) => {
      if (err) {
        return cb(err);
      }
      if (config.ENABLE_SESSION_CACHE) {
        redis.setex(key, config.SESSION_CACHE_SECONDS, JSON.stringify(session), (err) => {
          if (err) {
            logger.error(err);
          }
        });
      }
      return cb(null, session);
    });
  });
}

module.exports = buildSession;
