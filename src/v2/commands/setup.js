'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const exec = Promise.promisify(require('child_process').exec);
const State = require('../core/state');
const defaultTasks = {tasks: require('../tasks')};
const InvalidConfigError = require('../lib/errors').InvalidConfigError;

const validators = {
  varsIsObject: config => {
    if (!_.isPlainObject(config.vars)) {
      throw new InvalidConfigError('vars not a valid object');
    }
  },
  tasksIsObject: config => {
    if (!_.isPlainObject(config.tasks)) {
      throw new InvalidConfigError('tasks not a valid object');
    }
  },
  includeIsArray: config => {
    if (config.include && !_.isArray(config.include)) {
      throw new InvalidConfigError('include must be an array');
    }
  },
  includesHaveProperties: config => {
    if (!_.every(config.include, object => _.has(object, 'from') && _.has(object, 'import'))) {
      throw new InvalidConfigError('includes must all have "from" and "import" properties');
    }
  },
  tasksHaveDo: config => {
    _.mapValues(config.tasks, (task, key) => {
      if (!_.has(task, 'do')) {
        throw new InvalidConfigError(`task ${key} missing "do" property`);
      }
    });
  }
};

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
  _.mapValues(validators, validator => validator(config));
  const modulesToInstall = _.map(config.include, (include) => _.get(include, 'from'));
  return Promise.all(_.map(modulesToInstall, installModule))
  .then(() => {
    const includedTasks = _.reduce(config.include, requireTask, {});
    const initialState = _.merge({}, defaultTasks, includedTasks, config.vars, _.pick(config, 'tasks'), {tasks: includedTasks});
    const state = new State(initialState, logger);
    return state;
  });
});
