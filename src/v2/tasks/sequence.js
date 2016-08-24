'use strict';

const Promise = require('bluebird');
const task = require('../core/task');

module.exports = (state) => Promise.try(() => {
  const taskActions = state.peek().actions;
  return Promise.mapSeries(taskActions, step => task(step, state));
});
