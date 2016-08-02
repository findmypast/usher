'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const parse = require('./parse');
const setup = require('./setup');
const task = require('../core/task');
const loggers = require('../loggers');
const ParsingError = require('../lib/errors').ParsingError;
const TaskNotFoundError = require('../lib/errors').TaskNotFoundError;

const DEFAULT_FILE = 'usher.yml';

function parseVars(varList) {
  return {vars: _.fromPairs(_.map(varList, varPair => _.split(varPair, '=')))};
}

function getLogger(opts) {
  if (opts.verbose) {
    return loggers.verbose;
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
  const config = _.merge({}, parsedFile, parseVars(taskVars));
  return setup(config, Logger)
  .then(state => {
    const taskConfig = state.get(`tasks.${taskName}`);
    if (!taskConfig) {
      throw new TaskNotFoundError(taskName);
    }
    taskConfig.name = taskName;
    return task(taskConfig, state);
  });
});
