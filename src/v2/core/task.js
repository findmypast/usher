'use strict';

const Promise = require('bluebird');
const uuid = require('uuid').v4;
const _ = require('lodash');
const errors = require('../lib/errors');
const promiseRetry = require('promise-retry');

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
    const error = new errors.TaskNotFoundError(task.do);
    logger.error(error);
    throw error;
  }
  state.push(task);
  logger.task.begin(state);
  return promiseRetry((retry, number) => exec(state)
    .catch((e) => {
      const error = new errors.TaskFailedError(e, state);
      logger.task.fail(state, e, number);
      if (!state.get('options.ignore_errors')) {
        retry(error);
      }
    })
    .then((output) => {
      logger.task.end(state);
      const register = state.get('options.register');
      state.pop();
      if (register) {
        state.set(register, output);
      }
    }), state.get('options.retry', {retries: 0}));
});
