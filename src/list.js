'use strict';

const parser = require('js-yaml');
const chalk = require('chalk');
const fs = require('fs');
const _ = require('lodash');
const getTaskConfig = require('./modules/get-task-config');
let logger = require('winston');

function onlyDescription(task) {
  return _.isEqual(_.keys(task), ['description']);
}

function getDescriptionsFromTask(task) {
  return _.filter(_.map(task, (t) => t.description), (description) => description);
}

function listAll(opts) {
  const usherFile = opts.file || '.usher.yml';
  const usherConfigs = parser.safeLoad(fs.readFileSync(usherFile, 'utf8'));

  logger.info(chalk.bold(`All tasks for ${usherFile}:`));
  _.forOwn(usherConfigs.tasks, (config, key) => {
    const descriptionTask = _.find(config, (t) => t.description);
    const description = _.get(descriptionTask, 'description', '');
    logger.info(`${chalk.underline(key)} - ${description}`);
  });
}

function listTask(taskName, opts) {
  const taskConfig = getTaskConfig(taskName, {}, opts);
  const descriptionTask = _.find(taskConfig.task, (t) => t.description);
  const description = _.get(descriptionTask, 'description', '');

  const stepDescriptions = getDescriptionsFromTask(taskConfig.task);

  if (onlyDescription(descriptionTask)) {
    stepDescriptions.shift();
    logger.info(`${chalk.bold(taskName)} - ${chalk.underline(description)}`);
  }

  _.forEach(stepDescriptions, (desc) => {
    logger.info(`- ${desc}`);
  });
}

module.exports = (taskName, opts) => {
  if (!taskName) {
    listAll(opts);
  } else {
    listTask(taskName, opts);
  }
};
