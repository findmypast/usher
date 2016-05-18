'use strict';

const parser = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');

module.exports = (taskName, taskVars, opts) => {
  const usherFile = opts.filepath || '.usher.yml';
  const config = parser.safeLoad(fs.readFileSync(usherFile, 'utf8'));

  if (!_.isArray(config.tasks[taskName])) {
    throw new Error('Tasks should be array of commands');
  }

  return {
    vars: _.merge(config.vars, taskVars),
    task: config.tasks[taskName]
  };
};
