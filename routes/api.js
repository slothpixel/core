const express = require('express');
const spec = require('./spec');
const graphql = require('./graphql');

const api = new express.Router();

// API spec
api.get('/', (_, response) => {
  response.json(spec);
});

// API endpoints
Object.keys(spec.paths).forEach((path) => {
  Object.keys(spec.paths[path]).forEach((verb) => {
    const {
      route,
      func,
    } = spec.paths[path][verb];
    api[verb](route(), func);
  });
});

// API GraphQL endpoint
api.use('/graphql', graphql);

module.exports = api;
