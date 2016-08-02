'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const task = require('../core/task');

const ACCEPTED_OPTIONS = [
  'steps'
];

module.exports = (state) => Promise.try(() => {
  const options = _.reduce(ACCEPTED_OPTIONS, (result, value) => _.set(result, value, state.get(value)), {});
  return Promise.mapSeries(options.steps, step => task(step, state));
});
