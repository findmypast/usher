/* eslint-disable strict */

const TaskNotFoundError = require('../errors/task-not-found');
const buildArguments = require('../lib/build-arguments');
const buildParameters = require('../lib/build-parameters');
const expandParameterDefinitions = require('../lib/expand-parameter-definitions');
const initUsherfile = require('../lib/init-usherfile');

async function run(taskName, taskArgs, opts) {
  const usherfile = await initUsherfile(opts);

  const task = usherfile.tasks[taskName];
  if (task == null) throw new TaskNotFoundError(taskName);

  const parameterDefinitions = expandParameterDefinitions(usherfile.params);
  const initialParameters = buildParameters(taskName, task.params, parameterDefinitions);
  const taskArguments = buildArguments(taskArgs);
  const populatedParameters = populateParameters(initialParameters, taskArguments);
}

module.exports = run;
