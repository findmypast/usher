'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const exec = Promise.promisify(require('child_process').exec);
const State = require('../core/state');

function installModule(moduleName) {
  return exec(`npm install ${moduleName}`);
}

function requireTask(taskList, taskConfig) {
  const task = require(taskConfig.from);
  _.each(taskConfig.import, taskImport => {
    let requireName, taskName;
    const split = _.split(taskImport, ' as ');
    [requireName, taskName] = split.length === 2 ? split : [taskImport, taskImport];
    _.set(taskList, taskName, _.get(task, requireName));
  });
  return taskList;
}

module.exports = (config, logger) => Promise.try(() => {
  const modulesToInstall = _.map(config.include, (include) => _.get(include, 'from'));
  return Promise.all(_.map(modulesToInstall, installModule))
  .then(() => {
    const includedTasks = _.reduce(config.include, requireTask, {});
    const initialState = _.merge({}, includedTasks, config.vars, _.pick(config, 'tasks'), {tasks: includedTasks});
    const state = new State(initialState, logger);
    return state;
  });
});
