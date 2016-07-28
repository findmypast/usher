'use strict';

const uuid = require('uuid').v4;
const _ = require('lodash');
const errors = require('../lib/errors');

module.exports = (task, state) => Promise.try(() => {
  const logger = state.logger;
  task.id = uuid();
  let exec;
  if (_.isFunction(task)) {
    exec = task;
  }
  else if (task.do) {
    exec = state.get('tasks.' + task.do);
  }
  if (!exec) {
    const error = new errors.TaskNotFoundError(state.do);
    logger.error(error);
    throw error;
  }
  state.push(task);
  logger.task.begin();
  return exec(state)
    .catch((e) => {
      const error = new errors.TaskFailedError(e, state);
      logger.error(error, state);
      if (!state.get('options.ignore_errors')) {
        throw error;
      }
    })
    .then(() => logger.task.end());
});
