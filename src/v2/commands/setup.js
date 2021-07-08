'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const exec = require('child-process-promise').exec;
const State = require('../core/state');
const installDir = require('../core/installed-modules').installDir;
const defaultTasks = { tasks: require('../tasks') };
const InvalidConfigError = require('../lib/errors').InvalidConfigError;
const path = require('path');

const varRegexp = /<%=(.*?)%>/g;

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

function loadAndParseYmlFile(filename, propertyName, parser) {
  const file = parser(filename);
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

function importTasklist(taskList, taskConfig, usherFilePath, parser) {
  const [importName, aliasName] = getAlias(taskConfig.name || taskConfig.from);
  const tasks = _.endsWith(taskConfig.from, '.yml')
    ? loadAndParseYmlFile(path.join(usherFilePath, taskConfig.from), 'tasks', parser)
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
      const propertyTaskName = getAlias(taskImportName)[0];

      taskList[aliasName].tasks[propertyAliasName] = {
        tasks: importTasks(tasks[propertyTaskName].tasks)
      };
    });
  }

  return taskList;
}

function importVariables(varList, config, usherFilePath, parser) {
  const [importName] = getAlias(config.name || config.from);
  const isYmlFile = _.endsWith(config.from, '.yml');

  let variables = {};
  if (isYmlFile) {
    const filename = path.join(usherFilePath, config.from);
    variables = loadAndParseYmlFile(filename, 'vars', parser);
  }
  else {
    let mod = requireModule(importName);
    _.each(config.import, taskImportName => {
      const propertyTaskName = getAlias(taskImportName)[0];
      variables = _.merge(variables, mod[propertyTaskName].vars || {});
    });
  }



  varList = _.merge(varList, variables || {});
  return varList;
}

function interpolateModulesToInstall(config) {
  return _.map(config.include, (include) => {
    let module = _.get(include, 'from');
    let match = varRegexp.exec(module);

    while (match != null) {

      if (config.vars && config.vars[match[1]]) {
        module = module.replace(match[0], config.vars[match[1]]);
      }
      
      match = varRegexp.exec(module);
    }

    return module;
  });
}

module.exports = (config, Logger, usherFilePath, parser = require('./parse')) => Promise.try(() => {
  _.mapValues(validators, validator => validator(config));
  const modulesToInstall = interpolateModulesToInstall(config);
  return Promise.all(_.map(modulesToInstall, installModule))
    .then(() => {
      const reducedTasks = _.reduce(config.include, (acc, includeConfig) => importTasklist(acc, includeConfig, usherFilePath, parser), {});
      const reducedArgs = _.reduce(config.include, (acc, includeConfig) => importVariables(acc, includeConfig, usherFilePath, parser), {});
      const initialState = _.merge({}, defaultTasks, reducedArgs, config.vars, _.pick(config, 'tasks'), { tasks: reducedTasks });

      return new State(initialState, Logger);
    });
});
