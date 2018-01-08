'use strict';

const _ = require('lodash');
const parse = require('./parse');
const ParsingError = require('../lib/errors').ParsingError;
const TaskNotFoundError = require('../lib/errors').TaskNotFoundError;
const path = require('path');
const setup = require('./setup');
const Logger = require('../loggers/quiet');

const DEFAULT_FILE = 'usher.yml';

function replace(string, needle, replacement) {
  return string.split(needle).join(replacement);
}

function getTasksFromConfig(state, taskName, file) {
  const taskConfigs = taskName ? {[taskName]: state.get(`tasks.${replace(taskName, '.', '.tasks.')}`)} : state.get('tasks');

  if (!taskConfigs && taskName) {
    throw new TaskNotFoundError(taskName);
  }
  if (!taskConfigs) {
    throw new ParsingError('Unable to parse tasks', file);
  }

  return taskConfigs;
}

function extractTasksAndHighLevelDescriptions(acc, configs, prefix) {
  _.forOwn(configs, (value, key) => {
    if (value.description) {
      acc[prefix ? prefix + '.' + key : key] = [`${value.description}`];
    }
    else if (!value.tasks) {
      acc[prefix ? prefix + '.' + key : key] = [''];
    }
    if (value.tasks) {
      acc = extractTasksAndHighLevelDescriptions(acc, value.tasks, prefix ? prefix + '.' + key : (key));
    }
  });
  return acc;
}

function extractTaskAndAllDescriptions(acc, configs, taskName) {
  _.forOwn(configs, (value, key) => {
    if (value.description) {
      if (!acc[taskName]) {
        acc[taskName] = [];
      }
      acc[taskName].push(`${value.description}`);
    }
    if (value.tasks) {
      acc = extractTaskAndAllDescriptions(acc, value.tasks, taskName);
    }
    if (value.actions) {
      acc = extractTaskAndAllDescriptions(acc, value.actions, taskName);
    }
  });
  return acc;
}

module.exports = (taskName, opts) => {
  const file = opts.file || DEFAULT_FILE;
  let parsedFile;
  try {
    parsedFile = parse(file);
  }
  catch (error) {
    throw new ParsingError(error, file);
  }

  const usherFileInfo = path.parse(file);
  const config = _.merge({}, parsedFile, {vars: {}});

  return setup(config, Logger, usherFileInfo.dir)
  .then(state => {
    const acc = {};
    const taskConfigs = getTasksFromConfig(state, taskName, file);
    const tasksWithDescriptions = taskName ? extractTaskAndAllDescriptions(acc, taskConfigs, taskName) : extractTasksAndHighLevelDescriptions(acc, taskConfigs);
    return tasksWithDescriptions;
  });
};
