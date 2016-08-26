'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const exec = Promise.promisify(require('child_process').exec);
const State = require('../core/state');
const defaultTasks = {tasks: require('../tasks')};
const InvalidConfigError = require('../lib/errors').InvalidConfigError;

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
    // if (!_.every(config.include, object => _.has(object, 'from') && _.has(object, 'import'))) {
    //   throw new InvalidConfigError('includes must all have "from" and "import" properties');
    // }
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

function requireTask(taskList, taskConfig) {
  return require(taskConfig.name);
}

function loadAndParseYmlFile(taskList, taskConfig) {
  const file = require('./parse')(taskConfig.from);

  return file.tasks;
}

function importTasks(tasks) {
  const builtTasks = {};

  _.each(_.keys(tasks), taskName => {
    _.set(builtTasks, taskName, _.get(tasks, taskName));
  });

  return builtTasks;
}

function importTasklist(taskList, taskConfig) {
  const importName = taskConfig.name || taskConfig.from;
  const tasks = _.endsWith(taskConfig.from, '.yml')
    ? loadAndParseYmlFile(taskList, taskConfig)
    : requireTask(taskList, taskConfig);

  if (!taskConfig.import) {
    taskList[importName] = {
      tasks: importTasks(tasks)
    };
  }
  else {
    taskList[importName] = {
      tasks: {}
    };
    _.each(taskConfig.import, taskImport => {
      taskList[importName].tasks[taskImport] = {
        tasks: importTasks(tasks[taskImport])
      };
    });
  }

  return taskList;
}


module.exports = (config, Logger) => Promise.try(() => {
  _.mapValues(validators, validator => validator(config));
  const modulesToInstall = _.map(config.include, (include) => _.get(include, 'from'));
  return Promise.all(_.map(modulesToInstall, installModule))
  .then(() => {
    const reducedTasks = _.reduce(config.include, importTasklist, {});
    const initialState = _.merge({}, defaultTasks, config.vars, _.pick(config, 'tasks'), {tasks: reducedTasks});
    const state = new State(initialState, Logger);

    return state;
  });
});
