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
const DEFAULT_LOGGER = 'default';

function parseVars(varList) {
  return {vars: _.fromPairs(_.map(varList, varPair => _.split(varPair, '=')))};
}

module.exports = (taskName, taskVars, opts) => Promise.try(() => {
  const file = opts.file || DEFAULT_FILE;
  const loggerName = opts.logger || DEFAULT_LOGGER;
  const Logger = _.get(loggers, loggerName);
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
