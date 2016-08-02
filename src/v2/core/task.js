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
  return promiseRetry((retry, number) => {
    logger.begin(number, state.get('options.retry.retries') + 1);
    return exec(state)
    .catch((e) => {
      const error = new errors.TaskFailedError(e, state);
      logger.fail(e, number, state.get('options.retry.retries') + 1);
      if (!state.get('options.ignore_errors')) {
        retry(error);
      }
    })
    .then((output) => {
      logger.end();
      const register = state.get('options.register');
      state.pop();
      if (register) {
        state.set(register, output);
      }
    });
  }, state.get('options.retry', {retries: 0}));
});
