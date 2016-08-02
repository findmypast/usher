'use strict';

const Promise = require('bluebird');
const uuid = require('uuid').v4;
const _ = require('lodash');
const errors = require('../lib/errors');
const promiseRetry = require('promise-retry');

function runTask(task, state) {
  return Promise.try(() => {
    if (_.isFunction(task)) {
      return task(state);
    }
    const logger = state.logger;
    task.name = task.name || 'anonymous task';
    task.id = uuid();
    task.options = task.options || {};
    const retry = _.get(task.options, 'retry', {retries: 0});
    state.push(task);
    const subTask = state.get('tasks.' + task.do);
    if (!subTask) {
      const error = new errors.TaskNotFoundError(task.do);
      logger.error(error);
      throw error;
    }
    return promiseRetry((attempt, number) => {
      logger.begin(number, retry.retries + 1);
      return runTask(subTask, state)
      .catch((e) => {
        logger.fail(e, number, retry.retries + 1);
        if (!state.get('options.ignore_errors')) {
          attempt(e);
        }
      })
      .then(output => {
        logger.end();
        const register = state.get('options.register');
        state.pop();
        if (register) {
          state.set(register, output);
        }
        return output;
      });
    }, retry);
  });
}

module.exports = runTask;
