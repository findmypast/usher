'use strict';

const Promise = require('bluebird');
const crypto = require('crypto');
const _ = require('lodash');
const errors = require('../lib/errors');
const promiseRetry = require('promise-retry');

function getTask(task, state) {
  // Use the state to get the current path in the task tree and attempt to find
  // the task in that path. Do this first incase of name conflicts with other
  // tasks in the root of the tree.

  const currentPath = state.get('currentPath', '');

  let foundTask = state.get(`${currentPath}.${task.do}`);

  if (foundTask) {
    return foundTask;
  }

  foundTask = state.get('tasks.' + task.do);

  if (foundTask) {
    return foundTask;
  }


  // Attempt to find the task in the task tree - inject 'tasks' property
  // E.g.: shared_tasks.yeomon => tasks.shared_tasks.tasks.yeoman

  const path = _.reduce(task.do.split('.'), (acc, p) => {
    const taskName = (acc === '') ? 'tasks.' : '.tasks.';
    return `${acc}${taskName}${p}`;
  }, '');


  // Save the current path to the state

  const arr = path.split('.');
  arr.pop();

  state.set('currentPath', arr.join('.'));

  return state.get(path);
}

function finallyTask(task, state) {
  var finallyTaskName = _.get(task, 'finally_task', null);
  var finallyTaskConfig = {
    do: finallyTaskName
  };
  return finallyTaskName ? getTask(finallyTaskConfig, state) : null;
}

function performAnyFinalTask(task, state, taskRunner) {
  var finalTask = finallyTask(task, state);
  return finalTask ? taskRunner(finalTask, state) : null;
}

function runTask(task, state) {
  return Promise.try(() => {
    if (_.isFunction(task)) {
      return task(state);
    }
    const logger = state.logger;
    task.name = task.name || 'anonymous task';
    task.id = crypto.randomUUID();
    task.options = task.options || {};
    const retry = _.get(task.options, 'retry', {retries: 0});
    state.push(task);
    const subTask = getTask(task, state);

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
        performAnyFinalTask(task, state, runTask);
        if (!state.get('options.ignore_errors')) {
          attempt(e);
        }
      })
      .then(output => {
        logger.end();
        const register = state.get('options.register');
        const registerLast = state.get('options.register_last');

        state.pop();
        performAnyFinalTask(task, state, runTask);
        if (register) {
          state.set(register, output.toString().trim());
        }
        if (registerLast) {
          state.set(registerLast, output.slice(-1)[0].toString().trim());
        }
        return output;
      });
    }, retry);
  });
}

module.exports = runTask;
