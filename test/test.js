/* global before describe it after */
/* eslint-disable global-require, no-unused-vars */
/**
 * Main test script to run tests
 * */
process.env.NODE_ENV = 'test';
const async = require('async');
const nock = require('nock');
const assert = require('assert');
const supertest = require('supertest');
const config = require('../config');
const redis = require('../store/redis');
const processPlayerData = require('../processors/processPlayerData');

const playerApi = require('./data/player.json');
const findguildApi = require('./data/findguild.json');
const guildApi = require('./data/guild.json');
const boosterApi = require('./data/boosters.json');

// these are loaded later, as the database needs to be created when these are required
let app;
// fake api responses
nock('https://api.hypixel.net/')
  // fake player stats
  .persist()
  .get('/player')
  .query(true)
  .reply(200, playerApi)
  // fake guild stats
  .get('/findguild')
  .query(true)
  .reply(200, findguildApi)
  .get('/guild')
  .query(true)
  .reply(200, guildApi)
  // fake boosters
  .get('/boosters')
  .query(true)
  .reply(200, boosterApi);
before(function setup(done) {
  this.timeout(60000);
  async.series([
    function wipeRedis(callback) {
      console.log('wiping redis');
      redis.flushdb((error, success) => {
        console.log(error, success);
        callback(error);
      });
    },
    function startServices(callback) {
      console.log('starting services');
      app = require('../svc/web');
      callback();
    },
  ], done);
});

function testWhiteListedRoutes(done, key) {
  async.eachSeries(
    [
      `/api${key}`, // Docs
    ],
    (i, callback) => {
      supertest(app).get(i).end((error, response) => {
        if (error) {
          return callback(error);
        }

        assert.notEqual(response.statusCode, 429);
        return callback();
      });
    },
    done,
  );
}

function testRateCheckedRoute(done) {
  async.timesSeries(10, (i, callback) => {
    setTimeout(() => {
      supertest(app).get('/api/players/builder_247').end((error, response) => {
        if (error) {
          return callback(error);
        }
        assert.equal(response.statusCode, 200);
        return callback();
      });
    }, i * 300);
  }, done);
}

describe('parseStats', () => {
  it('should return parsed player stats', () => {
    const stats = processPlayerData(playerApi.player);
    assert.equal(stats.uuid, 'ef962ec2df6e48a2ac9d6062c1b84652');
  });
});
describe('api', () => {
  it('should get API spec', function testAPISpec(callback) {
    this.timeout(5000);
    supertest(app).get('/api').end((error, response) => {
      if (error) {
        return callback(error);
      }
      const spec = response.body;
      return async.eachSeries(Object.keys(spec.paths), (path, callback_) => {
        const replacedPath = path
          .replace(/{playerName}/, 'builder_247')
          .replace(/{game}/, 'SkyWars')
          .replace(/{resource}/, 'languages');
        async.eachSeries(Object.keys(spec.paths[path]), (verb, callback__) => {
          console.log(`${path}, ${path.indexOf('/bazaar')}`);
          if (path.indexOf('/leaderboards') === 0
            || path.indexOf('/sessions') === 0
            || path.indexOf('/bans') === 0
            || path.indexOf('/skyblock') === 0
            || path.endsWith('/recentGames')
            || path.endsWith('/status')
            || path.endsWith('/friends')
            || path.endsWith('/counts')
            || path.includes('/bazaar')
            || path.includes('/guilds/name')
            || path.includes('guilds/id')) {
            return callback__(error);
          }
          return supertest(app)[verb](`/api${replacedPath}?q=testsearch`).end((error, response) => {
            // console.log(verb, replacedPath, res.body);
            if (replacedPath.startsWith('/admin')) {
              assert.equal(response.statusCode, 403);
            } else {
              assert.equal(response.statusCode, 200);
            }
            return callback__(error);
          });
        }, callback_);
      }, callback);
    });
  });
});
describe('api limits', () => {
  before((done) => {
    config.ENABLE_API_LIMIT = true;
    config.API_FREE_LIMIT = 10;
    redis.multi()
      .del('user_usage_count')
      .del('usage_count')
      .sadd('api_keys', 'KEY')
      .exec((error) => {
        if (error) {
          return done(error);
        }

        return done();
      });
  });

  it('should be able to make API calls without key with whitelisted routes unaffected. One call should fail as rate limit is hit. Last ones should succeed as they are whitelisted', function testNoApiLimit(done) {
    this.timeout(25000);
    testWhiteListedRoutes((error) => {
      if (error) {
        done(error);
      } else {
        testRateCheckedRoute((error) => {
          if (error) {
            done(error);
          } else {
            supertest(app).get('/api/players/builder_247').end((error, response) => {
              if (error) {
                done(error);
              }
              assert.equal(response.statusCode, 429);
              assert.equal(response.body.error, 'monthly api limit exceeded');

              testWhiteListedRoutes(done, '');
            });
          }
        });
      }
    }, '');
  });

  /*
  it('should be able to make more than 10 calls when using API KEY', function testAPIKeyLimitsAndCounting(done) {
    this.timeout(25000);
    async.timesSeries(25, (i, cb) => {
      supertest(app).get('/api/players/hypixel?api_key=KEY').end((err, res) => {
        if (err) {
          return cb(err);
        }

        assert.equal(res.statusCode, 200);
        return cb();
      });
    }, () => {
      // Try whitelisted routes. Should not increment usage.
      testWhiteListedRoutes((err) => {
        if (err) {
          done(err);
        } else {
          // Try a 429. Should not increment usage.
          supertest(app).get('/gen429').end((err, res) => {
            if (err) {
              done(err);
            }
            assert.equal(res.statusCode, 429);

            // Try a 500. Should not increment usage.
            supertest(app).get('/gen500').end((err, res) => {
              if (err) {
                done(err);
              }
              assert.equal(res.statusCode, 500);
              redis.hgetall('usage_count', (err, res) => {
                if (err) {
                  done(err);
                } else {
                  const keys = Object.keys(res);
                  assert.equal(keys.length, 1);
                  assert.equal(Number(res[keys[0]]), 25);
                  done();
                }
              });
            });
          });
        }
      }, '?api_key=KEY');
    });
  });
  */

  after(() => {
    config.ENABLE_API_LIMIT = false;
    config.API_FREE_LIMIT = 50000;
  });
});
