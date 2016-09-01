'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const exec = Promise.promisify(require('child_process').exec);
const State = require('../core/state');
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
      throw new InvalidConfigError('includes must all have "from" and "import" properties');
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
  return exec(`npm install ${moduleName}`);
}

function requireTask(taskList, requireName, nodeModulesPath) {
  return require(`${nodeModulesPath}${requireName}`);
}

function loadAndParseYmlFile(taskList, filename) {
  const file = require('./parse')(filename);

  return file.tasks;
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

function importTasklist(taskList, taskConfig, usherFilePath, nodeModulesPath) {
  const [importName, aliasName] = getAlias(taskConfig.name || taskConfig.from);
  const tasks = _.endsWith(taskConfig.from, '.yml')
    ? loadAndParseYmlFile(taskList, path.join(usherFilePath, taskConfig.from))
    : requireTask(taskList, importName, nodeModulesPath);

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


module.exports = (config, Logger, usherFilePath, nodeModulesPath) => Promise.try(() => {
  _.mapValues(validators, validator => validator(config));
  const modulesToInstall = _.map(config.include, (include) => _.get(include, 'from'));
  return Promise.all(_.map(modulesToInstall, installModule))
  .then(() => {
    const reducedTasks = _.reduce(config.include, (acc, includeConfig) =>
      importTasklist(acc, includeConfig, usherFilePath, nodeModulesPath), {});
    const initialState = _.merge({}, defaultTasks, config.vars, _.pick(config, 'tasks'), {tasks: reducedTasks});
    const state = new State(initialState, Logger);

    return state;
  });
});
