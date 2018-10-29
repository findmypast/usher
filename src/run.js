'use strict';

const getVersion = require('./lib/get-version');
const Logger = require('./v2/loggers/default');

const logger = new Logger();

const runCommandsByVersion = {
  1: require('./v1/run'),
  2: require('./v2/commands/run')
}

async function getRunCommandForVersion(filename) {
  const version = await getVersion(filename);

  return version === '0' ? null : runCommandsByVersion[version];
}

module.exports = async function(taskName, taskVars, opts) {
  const runCommand = await getRunCommandForVersion(opts.file);

  if (runCommand == null) {
    const msg = opts.file
      ? `The command 'usher run ${taskname}' could not be run for the specified file, please ensure task exists`
      : `The command 'usher run ${taskname}' could not be run, please ensure an usher file with a task matching '${taskname}' exists`;

    logger.info(chalk.red(chalk.bold(msg)));

    return;
  }

  runCommand(taskName, taskVars, opts);
};
