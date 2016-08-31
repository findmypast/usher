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

module.exports = (taskName, taskVars, opts) => Promise.try(() => {
  const file = opts.file || DEFAULT_FILE;
  const Logger = getLogger(opts);
  let parsedFile;
  try {
    parsedFile = parse(file);
  }
  catch (error) {
    throw new ParsingError(error, file);
  }
  const usherFileInfo = path.parse(file);
  const config = _.merge({}, parsedFile, parseVars(taskVars));
  const nodeModulesPath = `${process.cwd()}/node_modules/`;

  return setup(config, Logger, usherFileInfo.dir, nodeModulesPath)
  .then(state => {
    const taskConfig = state.get(`tasks.${taskName}`);
    if (!taskConfig) {
      throw new TaskNotFoundError(taskName);
    }
    taskConfig.name = taskName;
    return task(taskConfig, state);
  });
});
