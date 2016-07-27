'use strict';

const uuid = require('uuid').v4;
const _ = require('lodash');
const errors = require('../lib/errors');

module.exports = (logger) => (state, name = 'anonymous task') => Promise.try(() => {
  state.id = uuid();
  state.name = name;
  const task = _.get(state.tasks, state.do, false);
  if (!task) {
    const error = new errors.TaskNotFoundError(state.do);
    logger.error(error, state);
    throw error;
  }
  logger.task.begin(state.id, state);
  return task(state, logger)
    .catch((e) => {
      const error = new errors.TaskFailedError(e, state);
      logger.error(error, state);
      if (!_.get(state, 'options.ignore_errors')) {
        throw error;
      }
    })
    .then(() => logger.task.end(state.id));
});
