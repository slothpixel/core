/* global describe it */
/**
 * Main test script to run tests
 * */
process.env.NODE_ENV = 'test';
const nock = require('nock');
const assert = require('assert');
// const supertest = require('supertest');

const processPlayerData = require('../processors/processPlayerData');

const playerApi = require('./data/player');
const guildApi = require('./data/guild');

// fake api responses
nock('https://api.hypixel.net/')
  // fake player stats
  .get('/player')
  .query(true)
  .reply(200, playerApi)
  // fake guild stats
  .get('/guild')
  .query(true)
  .reply(200, guildApi);

describe('parseStats', () => {
  it('should return parsed player stats', () => {
    const stats = processPlayerData(playerApi.player);
    assert.equal(stats.uuid, 'ef962ec2df6e48a2ac9d6062c1b84652');
  });
});
