'use strict';

const parser = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');
const logger = require('winston');

module.exports = (taskName, taskVars, opts) => {

  const usherFile = opts.file || '.usher.yml';
  logger.verbose(`Parsing ${usherFile}`);
  const config = parser.load(fs.readFileSync(usherFile, 'utf8'));

  logger.verbose(`Loading task ${taskName}`);

  const task = config.tasks[taskName];
  if (!task) {
    throw new Error(`Task: ${taskName} does not exist!`);
  }
  if (!_.isArray(task)) {
    throw new Error('Tasks should be array of commands');
  }

  return {
    vars: _.merge(config.vars, taskVars),
    task: config.tasks[taskName]
  };
};
