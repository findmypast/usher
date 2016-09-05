'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const task = require('../core/task');

const ACCEPTED_OPTIONS = [
  'every',
  'in',
  'exec'
];

module.exports = (state) => Promise.try(() => {
  const options = _.reduce(ACCEPTED_OPTIONS, (result, value) => _.set(result, value, state.get(value)), {});
  return Promise.map(options.in.split(','), value => task({
    description: `${options.exec} with ${options.every}=${value}`,
    do: options.exec,
    [options.every]: value}, _.cloneDeep(state)));
});
