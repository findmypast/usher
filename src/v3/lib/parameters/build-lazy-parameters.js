function buildLazyParameters(parameters, actions) {
  const isUnpopulated = createUnpopulatedParameterFilter(parameters);
  const mapRegistration = createRegistrationMapper(actions);
  const mapUsage = createUsageMapper(actions);

  return Object.keys(parameters)
    .filter(isUnpopulated)
    .map(createLazyParameterEntry)
    .map(mapRegistration)
    .map(mapUsage);
}

module.exports = buildLazyParameters;

function createUnpopulatedParameterFilter(parameters) {
  return function(parameterName) {
    return parameters[parameterName].value == null;
  }
}

function createLazyParameterEntry(parameter) {
  return { name: parameter, registration: -1, usage: -1 };
}

function createRegistrationMapper(actions) {
  return function (lazyParameter) {
    const registrationFinder = createRegistrationFinder(lazyParameter.name);
    const registration = actions.findIndex(registrationFinder);

    return Object.assign({}, lazyParameter, { registration });
  }
}

function createRegistrationFinder(parameterName) {
  return function (action) {
    return action.options && action.options.register === parameterName;
  }
}

function createUsageMapper(actions) {
  return function (lazyParameter) {
    const usageFinder = createUsageFinder(lazyParameter.name);
    const usage = actions.findIndex(usageFinder);

    return Object.assign({}, lazyParameter, { usage });
  }
}

function createUsageFinder(parameterName) {
  const pattern = new RegExp(`<%=\\s*${parameterName}\\s*%>`);

  return function (action) {
    return pattern.test(action.do)
      || action.do === 'shell' && pattern.test(action.command)
      || action.do === 'for' && pattern.test(action.exec);
  }
}
