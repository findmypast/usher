'use strict';

const firstline = require('firstline');
const v1 = require('./v1/list');
const v2 = require('./v2/commands/list');
const listView = require('./list-view');
const chalk = require('chalk');
const Logger = require('./v2/loggers/default');
const logger = new Logger();

function isV2(file) {
  return firstline(file).then(line => line.match(/version.*'2'/) || line.match(/version.*"2"/));
}

function checkVersion(fileName) {
  return isV2(fileName)
  .then(result => {
    if (result) {
      return v2;
    }
    return v1;
  });
}

module.exports = (taskName, opts) => {
  return checkVersion(opts.file)
    .catch(() => checkVersion('.usher.yml'))
    .catch(() => checkVersion('usher.yml'))
    .then(list => list(taskName, opts))
    .then(tasksAndTheirDescriptions => {
      logger.info(chalk.bold(`Listing tasks under ${taskName ? taskName : (opts.file || '.usher.yml')}:`));
      listView(logger.info, tasksAndTheirDescriptions);
    });
};
