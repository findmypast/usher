const buildLazyParameters = require('./build-lazy-parameters');

function markLazyParameters(parameters, actions) {
  const lazyParameters = buildLazyParameters(parameters, actions);
  const lazyParameterReducer = createLazyParameterReducer(
    parameters,
    lazyParameters
  );

  return Object.keys(parameters).reduce(lazyParameterReducer, {});
}

module.exports = markLazyParameters;

function createLazyParameterReducer(parameters, lazyParameters) {
  return function (updatedParameters, parameterName) {
    const byNameFinder = findLazyParameterByName(parameterName);
    const lazyParameter = lazyParameters.find(byNameFinder);

    if (lazyParameter == null) {
      return Object.assign({}, updatedParameters, {
        [parameterName]: parameters[parameterName]
      })
    }

    const { registration, usage } = lazyParameter;
    const updatedParameter = Object.assign({}, parameters[parameterName], {
      lazy: registration < usage && registration > -1
    });

    return Object.assign({}, updatedParameters, {
      [parameterName]: updatedParameter
    })
  }
}

function findLazyParameterByName(parameterName) {
  return function ({ name }) { return name === parameterName };
}
