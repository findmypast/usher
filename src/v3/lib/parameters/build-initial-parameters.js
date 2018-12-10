const isEmpty = require('../is-empty');
const UndeclaredParameterError = require('../../errors/undeclared-parameter');

function buildParameters(taskName, taskParameters, parameterDefinitions) {
  if (isEmpty(taskParameters)) return {};

  const parameterBuilder = createParameterBuilder(taskName, parameterDefinitions);

  return taskParameters.reduce(parameterBuilder, {});
}

module.exports = buildParameters;

function createParameterBuilder(taskName, parameterDefinitions) {
  const availableParameters = Object.keys(parameterDefinitions);

  return function(parameters, taskParameter) {
    const definition = parameterDefinitions[taskParameter];

    if (definition == null) {
      throw new UndeclaredParameterError(taskParameter, taskName);
    }

    const parameter = {
      lazy: false,
      required: definition.required,
      value: definition.default,
    };

    return Object.assign({}, parameters, { [taskParameter]: parameter });
  }
}
