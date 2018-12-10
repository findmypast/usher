const isEmpty = require('./is-empty');

function expandParameterDefinitions(parameters) {
  if (isEmpty(parameters)) return {};
  
  const parameterNames = Object.keys(parameters);
  const parameterExpander = createParameterDefinitionExpander(parameters);

  return parameterNames.reduce(parameterExpander, {});
}

module.exports = expandParameterDefinitions;

function createParameterDefinitionExpander(parameters) {
  return function(expandedParameterDefinitions, parameterName) {
    const parameterDefinition = parameters[parameterName];

    const expandedParameterDefinition = typeof parameterDefinition === 'string'
      ? { description: parameterDefinition, default: undefined, required: true }
      : parameterDefinition;

    return Object.assign({}, expandedParameterDefinitions, {
      [parameterName]: expandedParameterDefinition
    })
  }
}