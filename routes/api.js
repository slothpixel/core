const express = require('express');
const config = require('../config');

const spec = { paths: [] };

const api = new express.Router();

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

module.exports = api;
