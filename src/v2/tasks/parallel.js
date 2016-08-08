'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const task = require('../core/task');

const ACCEPTED_OPTIONS = [
  'actions'
];

module.exports = (state) => Promise.try(() => {
  const options = _.reduce(ACCEPTED_OPTIONS, (result, value) => _.set(result, value, state.get(value)), {});
  return Promise.map(options.actions, action => task(action, _.cloneDeep(state)));
});
