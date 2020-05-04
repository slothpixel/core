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

const playerApi = require('./data/player');
const findguildApi = require('./data/findguild');
const guildApi = require('./data/guild');
const boosterApi = require('./data/boosters');

// these are loaded later, as the database needs to be created when these are required
let db;
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
    function wipeRedis(cb) {
      console.log('wiping redis');
      redis.flushdb((err, success) => {
        console.log(err, success);
        cb(err);
      });
    },
    function initDB(cb) {
      db = require('../store/db');
      cb();
    },
    function startServices(cb) {
      console.log('starting services');
      app = require('../svc/web');
      cb();
    },
  ], done);
});

describe('parseStats', () => {
  it('should return parsed player stats', () => {
    const stats = processPlayerData(playerApi.player);
    assert.equal(stats.uuid, 'ef962ec2df6e48a2ac9d6062c1b84652');
  });
});
describe('api', () => {
  it('should get API spec', function testAPISpec(cb) {
    this.timeout(5000);
    supertest(app).get('/api').end((err, res) => {
      if (err) {
        return cb(err);
      }
      const spec = res.body;
      return async.eachSeries(Object.keys(spec.paths), (path, cb) => {
        const replacedPath = path
          .replace(/{playerName}/, 'builder_247')
          .replace(/{game}/, 'SkyWars')
          .replace(/{resource}/, 'languages');
        async.eachSeries(Object.keys(spec.paths[path]), (verb, cb) => {
          console.log(`${path}, ${path.indexOf('/bazaar')}`);
          if (path.indexOf('/leaderboards') === 0
            || path.indexOf('/sessions') === 0
            || path.indexOf('/bans') === 0
            || path.indexOf('/skyblock') === 0
            || path.endsWith('/recentGames')
            || path.indexOf('/bazaar') !== -1) {
            return cb(err);
          }
          return supertest(app)[verb](`/api${replacedPath}?q=testsearch`).end((err, res) => {
            // console.log(verb, replacedPath, res.body);
            if (replacedPath.startsWith('/admin')) {
              assert.equal(res.statusCode, 403);
            } else {
              assert.equal(res.statusCode, 200);
            }
            return cb(err);
          });
        }, cb);
      }, cb);
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
      .exec((err) => {
        if (err) {
          return done(err);
        }

        return done();
      });
  });
  function testWhiteListedRoutes(done, key) {
    async.eachSeries(
      [
        `/api${key}`, // Docs
      ], (i, cb) => {
        supertest(app).get(i).end((err, res) => {
          if (err) {
            return cb(err);
          }

          assert.notEqual(res.statusCode, 429);
          return cb();
        });
      },
      done,
    );
  }

  function testRateCheckedRoute(done) {
    async.timesSeries(10, (i, cb) => {
      setTimeout(() => {
        supertest(app).get('/api/players/builder_247').end((err, res) => {
          if (err) {
            return cb(err);
          }
          assert.equal(res.statusCode, 200);
          return cb();
        });
      }, i * 300);
    }, done);
  }

  it('should be able to make API calls without key with whitelisted routes unaffected. One call should fail as rate limit is hit. Last ones should succeed as they are whitelisted', function testNoApiLimit(done) {
    this.timeout(25000);
    testWhiteListedRoutes((err) => {
      if (err) {
        done(err);
      } else {
        testRateCheckedRoute((err) => {
          if (err) {
            done(err);
          } else {
            supertest(app).get('/api/players/builder_247').end((err, res) => {
              if (err) {
                done(err);
              }
              assert.equal(res.statusCode, 429);
              assert.equal(res.body.error, 'monthly api limit exceeded');

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
