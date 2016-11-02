'use strict';

const parser = require('js-yaml');
const fs = require('fs');
const _ = require('lodash');
const getTaskConfig = require('./modules/get-task-config');

function getDescriptionsFromTask(task) {
  return _.filter(_.map(task, (t) => t.description), (description) => description);
}

function listAll(opts) {
  const usherFile = opts.file || '.usher.yml';
  const usherConfigs = parser.safeLoad(fs.readFileSync(usherFile, 'utf8'));
  const taskList = {};

  _.forOwn(usherConfigs.tasks, (config, key) => {
    const descriptionTask = _.find(config, (t) => t.description);
    const description = _.get(descriptionTask, 'description', '');
    taskList[key] = [description];
  });

  return taskList;
}

function listTask(taskName, opts) {
  const taskConfig = getTaskConfig(taskName, {}, opts);
  const stepDescriptions = getDescriptionsFromTask(taskConfig.task);

  const task = {
    [taskName]: stepDescriptions
  };

  return task;
}

module.exports = (taskName, opts) => {
  if (!taskName) {
    return listAll(opts);
  }
  else {
    return listTask(taskName, opts);
  }
};
