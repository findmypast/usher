'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const exec = Promise.promisify(require('child_process').exec);
const State = require('../core/state');
const installDir = require('../core/installed-modules').installDir;
const defaultTasks = {tasks: require('../tasks')};
const InvalidConfigError = require('../lib/errors').InvalidConfigError;
const path = require('path');

function tasksHaveDo(config) {
  _.mapValues(config.tasks, (task, key) => {
    if (_.has(task, 'tasks')) {
      tasksHaveDo(task.tasks);
    }
    else {
      if (!_.has(task, 'do')) {
        throw new InvalidConfigError(`task ${key} missing "do" property`);
      }
    }
  });
}

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
    if (!_.every(config.include, object => _.has(object, 'from'))) {
      throw new InvalidConfigError('includes must all have "from"');
    }
  },
  tasksHaveDo: config => {
    tasksHaveDo(config);
  }
};

function installModule(moduleName) {
  if (_.endsWith(moduleName, '.yml')) {
    return Promise.resolve();
  }

  return exec(`npm install ${moduleName} --prefix ${installDir()}`);
}

function requireModule(requireName) {
  return require(`${installDir()}/node_modules/${requireName}`);
}

function loadAndParseYmlFile(taskList, filename, propertyName) {
  const file = require('./parse')(filename);

  return file[propertyName];
}

function importTasks(tasks) {
  const builtTasks = {};

  _.each(_.keys(tasks), taskName => {
    _.set(builtTasks, taskName, _.get(tasks, taskName));
  });

  return builtTasks;
}

function getAlias(name) {
  const split = _.split(name, ' as ');

  if (split.length === 1) {
    split.push(name); // Alias name same as name if no alias specified
  }

  return split;
}

function importTasklist(taskList, taskConfig, usherFilePath) {
  const [importName, aliasName] = getAlias(taskConfig.name || taskConfig.from);
  const tasks = _.endsWith(taskConfig.from, '.yml')
    ? loadAndParseYmlFile(taskList, path.join(usherFilePath, taskConfig.from), 'tasks')
    : requireModule(importName);

  if (!taskConfig.import) {
    taskList[aliasName] = {
      tasks: importTasks(tasks)
    };
  }
  else {
    taskList[aliasName] = {
      tasks: {}
    };
    _.each(taskConfig.import, taskImportName => {
      const propertyAliasName = getAlias(taskImportName)[1];
      taskList[aliasName].tasks[propertyAliasName] = {
        tasks: importTasks(tasks[propertyAliasName])
      };
    });
  }

  return taskList;
}

function importVariables(varList, config, usherFilePath) {
  const [importName] = getAlias(config.name || config.from);
  const variables = _.endsWith(config.from, '.yml')
    ? loadAndParseYmlFile(varList, path.join(usherFilePath, config.from), 'vars')
    : requireModule(importName).vars;

  return variables || {};
}

module.exports = (config, Logger, usherFilePath) => Promise.try(() => {
  _.mapValues(validators, validator => validator(config));
  const modulesToInstall = _.map(config.include, (include) => _.get(include, 'from'));
  return Promise.all(_.map(modulesToInstall, installModule))
  .then(() => {
    const reducedTasks = _.reduce(config.include, (acc, includeConfig) =>
      importTasklist(acc, includeConfig, usherFilePath), {});
    const reducedArgs = _.reduce(config.include, (acc, includeConfig) =>
      importVariables(acc, includeConfig, usherFilePath), {});
    const initialState = _.merge({}, defaultTasks, config.vars, reducedArgs, _.pick(config, 'tasks'), {tasks: reducedTasks});
    const state = new State(initialState, Logger);

    return state;
  });
});
