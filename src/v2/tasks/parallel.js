'use strict';

const Promise = require('bluebird');
const task = require('../core/task');

module.exports = (state) => Promise.try(() => {
  const taskActions = state.peek().actions;
  return Promise.map(state.dereference(taskActions), step => task(step, state));
});
