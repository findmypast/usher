'use strict';

const chalk = require('chalk');
const getVersion = require('./lib/get-version');
const listView = require('./lib/list-view');
const Logger = require('./lib/loggers/default');
const v1 = require('./v1/list');
const v2 = require('./v2/commands/list');

const listCommandsByVersion = {
  1: require('./v1/list'),
  2: require('./v2/commands/list'),
  3: require('./v3/commands/list')
}

const logger = new Logger();

async function getListCommandForVersion(filename) {
  const version = await getVersion(filename);

  return version === '0' ? null : listCommandsByVersion[version];
}

module.exports = async function(taskName, opts) {
  const listCommand = await getListCommandForVersion(opts.file);

  if (listCommand == null) {
    const msg = opts.file
      ? `The command 'usher list' could not be run for the specified file, please ensure a valid version is specified`
      : `The command 'usher list' could not be run, please ensure an usher file with a valid version exists in the current directory`;

    logger.info(chalk.red(chalk.bold(msg)));

    return;
  }

  const list = await listCommand(taskName, opts);
  logger.info(chalk.bold(`Listing tasks under ${taskName ? taskName : (opts.file || '.usher.yml')}:`));
  
  listView(logger.info, list);
};
