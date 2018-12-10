function populateParameters(initialParameters, taskArguments) {
  const parameterNames = Object.keys(initialParameters);
  const populator = createParameterPopulator(initialParameters, taskArguments);

  return parameterNames.reduce(populator, {});
}

module.exports = populateParameters;

function createParameterPopulator(initialParameters, taskArguments) {
  return function(parameters, parameterName) {
    const initialParameter = initialParameters[parameterName];
    const value = taskArguments[parameterName] || initialParameter.value;

    const parameter = Object.assign({}, initialParameters[parameterName], {
      value
    });

    return Object.assign({}, parameters, { [parameterName]: parameter });
  }
}