'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const task = require('../core/task');

const ACCEPTED_OPTIONS = [
  'every',
  'in',
  'exec'
];

function optionAsArray(option) {
  return _.isArray(option) ? option : option.split(',');
}

module.exports = (state) => Promise.try(() => {
  const options = _.reduce(ACCEPTED_OPTIONS, (result, value) => _.set(result, value, state.get(value)), {});
  return Promise.map(optionAsArray(options.in), value => task({
    description: `${options.exec} with ${options.every}=${value}`,
    do: options.exec,
    [options.every]: value}, _.cloneDeep(state)));
});
