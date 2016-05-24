'use strict';

let TaskRunner = require('./modules/task-runner');
const _ = require('lodash');
const getTaskConfig = require('./modules/get-task-config');
const logger = require('winston');

module.exports = (taskName, taskVars, opts) => {
  logger.cli();
  if (opts.verbose) {
    logger.level = 'verbose';
  }
  if (opts.quiet) {
    logger.level = 'error';
  }

  const splitVars = _.map(taskVars, a => a.split('='));
  const parsedVars = _.fromPairs(splitVars);
  const taskConfig = getTaskConfig(taskName, parsedVars, opts);
  const taskRunner = new TaskRunner(taskConfig.task, taskConfig.vars, opts);

  taskRunner.execute();
};
