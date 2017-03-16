'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const parse = require('./parse');
const setup = require('./setup');
const task = require('../core/task');
const loggers = require('../loggers');
const ParsingError = require('../lib/errors').ParsingError;
const TaskNotFoundError = require('../lib/errors').TaskNotFoundError;
const path = require('path');

const DEFAULT_FILE = 'usher.yml';

const FIRST_EQUALS_CHARACTER = /=([\s\S]+)/;

function parseVars(varList) {
  return {vars: _.fromPairs(_.map(varList, varPair => _.split(varPair, FIRST_EQUALS_CHARACTER)))};
}

function getLogger(opts) {
  if (opts.verbose) {
    return loggers.verbose;
  }
  if (opts.quiet) {
    return loggers.quiet;
  }
  return loggers.default;
}

function replace(string, needle, replacement) {
  return string.split(needle).join(replacement);
}

function getTaskConfig(taskName, state, throwOnMissing) {
  var fullTaskName = `tasks.${replace(taskName, '.', '.tasks.')}`;

  const taskConfig = state.get(fullTaskName);

  if (throwOnMissing && !taskConfig) {
    throw new TaskNotFoundError(fullTaskName);
  }

  if (taskConfig) {
    taskConfig.name = taskName;
  }

  return taskConfig;
}

function execFinallyIfPresent(state, initialTaskConfig) {
  const finallyTaskName = (initialTaskConfig && initialTaskConfig.finally_task) || state.get('finally_task') || 'finally';
  const taskConfig = getTaskConfig(finallyTaskName, state, false);

  return taskConfig ? task(taskConfig, state) : Promise.resolve();
}

function execCatchIfPresent(state, initialTaskConfig) {
  const catchTaskName = (initialTaskConfig && initialTaskConfig.catch_task) || state.get('catch_task') || 'catch';
  const taskConfig = getTaskConfig(catchTaskName, state, false);

  return taskConfig ? task(taskConfig, state) : Promise.resolve();
}

function cleanup(state, err, initialTaskConfig) {
  return execCatchIfPresent(state, initialTaskConfig)
    .then(() => execFinallyIfPresent(state))
    .then(() => err)
    .catch(cleanupErr => `Unrecoverable error when handling catch/finally block:\n${cleanupErr}\nOriginal error:\n${err}`);
}

module.exports = (taskName, taskVars, opts) => Promise.try(() => {
  const file = opts.file || DEFAULT_FILE;
  const Logger = getLogger(opts);
  const logger = new Logger();

  let parsedFile;
  try {
    parsedFile = parse(file);
  }
  catch (error) {
    throw new ParsingError(error, file);
  }

  const usherFileInfo = path.parse(file);
  const config = _.merge({}, parsedFile, parseVars(taskVars));

  return setup(config, Logger, usherFileInfo.dir)
  .then(state => {
    const taskConfig = getTaskConfig(taskName, state, true);

    return task(taskConfig, state)
      .then(() => execFinallyIfPresent(state, taskConfig))
      .catch(err => {
        logger.info('Oops, something has gone wrong. Attempting to cleanup...');
        return cleanup(state, err, taskConfig)
          .then(cleanupErr => Promise.reject(cleanupErr));
      });
  });
});
