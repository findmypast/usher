const _ = require('lodash');

const RequiredParameterError = require('../errors/required-parameter');
const TaskNotFoundError = require('../errors/task-not-found');

const buildArguments = require('../lib/build-arguments');
const buildContext = require('../lib/build-context');
const buildExecutionFlow = require('../lib/build-execution-flow');
const buildParameters = require('../lib/build-parameters');
const expandParameterDefinitions = require('../lib/expand-parameter-definitions');
const initUsherfile = require('../lib/init-usherfile');
const resolveDependencies = require('../lib/resolve-dependencies');
const runAction = require('../lib/run-action');

async function run(taskName, taskArgs, opts) {
  const usherfile = await initUsherfile(opts);

  const task = usherfile.tasks[taskName];
  if (task == null) throw new TaskNotFoundError(taskName);

  const parameterDefinitions = expandParameterDefinitions(usherfile.params);
  const taskArguments = buildArguments(taskArgs);
  const parameters = buildParameters(taskName, task, parameterDefinitions, taskArguments);
  
  const missingParametersDictionary = _.pickBy(parameters, requiredEagerParameter);
  const missingParameters = Object.keys(missingParametersDictionary);
  if (missingParameters.length > 0) throw new RequiredParameterError(missingParameters, taskName);

  const dependencyTree = resolveDependencies(usherfile, taskName);
  const executionFlow = buildExecutionFlow(dependencyTree);
  const startingContext = buildContext(usherfile.vars, parameters);
}

module.exports = run;

function requiredEagerParameter({ lazy, required, value }) {
  return required && value == null && !lazy;
}
