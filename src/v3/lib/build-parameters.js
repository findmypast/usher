const isEmpty = require('./is-empty');
const buildInitialParameters = require('./parameters/build-initial-parameters');
const markLazyParameters = require('./parameters/mark-lazy-parameters');
const populateParameters = require('./parameters/populate-parameters');
const UndeclaredParameterError = require('../errors/undeclared-parameter');
const UnusedArgumentError = require('../errors/unused-argument');

function buildParameters(taskName, task, parameterDefinitions, taskArguments) {
  if (noParametersOrArguments(parameterDefinitions, task.params, taskArguments)) {
    return {};
  };

  if (undeclaredParameter(parameterDefinitions, task.params)) {
    throw new UndeclaredParameterError(task.params[0], taskName);
  }

  if (unusedArgument(parameterDefinitions, taskArguments)) {
    const taskArgumentNames = Object.keys(taskArguments);
    throw new UnusedArgumentError(taskArgumentNames[0], taskName);
  }

  const initialParameters = buildInitialParameters(taskName, task.params, parameterDefinitions);
  const populatedParameters = populateParameters(initialParameters, taskArguments);
  
  return markLazyParameters(populatedParameters, task.actions);
}

module.exports = buildParameters;

function noParametersOrArguments(parameterDefinitions, taskParameters, taskArguments) {
  return isEmpty(parameterDefinitions) && isEmpty(taskParameters) && isEmpty(taskArguments);
}

function undeclaredParameter(parameterDefinitions, taskParameters) {
  return isEmpty(parameterDefinitions) && !isEmpty(taskParameters);
}

function unusedArgument(parameterDefinitions, taskArguments) {
  return isEmpty(parameterDefinitions) && !isEmpty(taskArguments);
}
