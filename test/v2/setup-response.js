'use strict';

const usherFileState = require('./initial-state.json');
const logger = require('./mock-logger');
const State = require('../../src/v2/core/state');
const defaultTasks = {tasks: require('../../src/v2/tasks')};
const _ = require('lodash');
const initialState = _.merge(usherFileState, defaultTasks);

module.exports = (config, Logger, usherFilePath) => {
  return Promise.resolve(new State(initialState, logger));
};
