'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const task = require('../core/task');

const ACCEPTED_OPTIONS = [
  'every',
  'in',
  'exec',
  'options'
];

function optionAsArray(option) {
  return _.isArray(option) ? option : option.split(',');
}

function runParallel(settings, state) {
  return Promise.map(optionAsArray(settings.in), value => task({
    description: `${settings.exec} with ${settings.every}=${value}`,
    do: settings.exec,
    [settings.every]: value}, _.cloneDeep(state)));
}

function runSequential(settings, state) {
  return Promise.each(optionAsArray(settings.in), value => task({
    description: `${settings.exec} with ${settings.every}=${value}`,
    do: settings.exec,
    [settings.every]: value}, _.cloneDeep(state)));
}

module.exports = (state) => Promise.try(() => {
  const settings = _.reduce(ACCEPTED_OPTIONS, (result, value) => _.set(result, value, state.get(value)), {});
  const options = settings.options || {};

  const run = options.sequential ? runSequential : runParallel;

  return run(settings, state);
});
