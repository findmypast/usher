'use strict';

const parser = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');
const getTaskConfig = require('./modules/get-task-config');
let logger = require('winston');

function listAll(opts) {
  const usherFile = opts.filepath || '.usher.yml';
  const usherConfigs = parser.safeLoad(fs.readFileSync(usherFile, 'utf8'));

  logger.info(`All tasks for ${usherFile}:`);
  _.forOwn(usherConfigs.tasks, (config, key) => {
    const descriptionTask = _.find(config, (t) => t.description);
    const description = _.get(descriptionTask, 'description', '');
    logger.info(`${key} - ${description}`);
  });
}

function listTask(taskName, opts) {
  const taskConfig = getTaskConfig(taskName, {}, opts);
  const descriptionTask = _.find(taskConfig.task, (t) => t.description);
  const description = _.get(descriptionTask, 'description', '');
  logger.info(description);
}

module.exports = (taskName, opts) => {
  if (!taskName) {
    listAll(opts);
  }
  else {
    listTask(taskName, opts);
  }
};
