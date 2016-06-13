'use strict';

const parser = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');
const logger = require('winston');

module.exports = (taskName, taskVars, opts) => {
  const usherFile = opts.filepath || '.usher.yml';
  logger.verbose(`Parsing ${usherFile}`);
  const config = parser.safeLoad(fs.readFileSync(usherFile, 'utf8'));

  logger.verbose(`Loading task ${taskName}`);
  if (!_.isArray(config.tasks[taskName])) {
    throw new Error('Tasks should be array of commands');
  }

  return {
    vars: _.merge(config.vars, taskVars),
    task: config.tasks[taskName]
  };
};
