'use strict';

const _ = require('lodash');
const getTaskConfig = require('./modules/get-task-config');
let logger = require('winston');

module.exports = (taskName, opts) => {

  const taskConfig = getTaskConfig(taskName, {}, opts);
  const descriptionTask = _.find(taskConfig.task, (t) => t.description);
  const description = _.get(descriptionTask, 'description', '');
  logger.info(description);
};
