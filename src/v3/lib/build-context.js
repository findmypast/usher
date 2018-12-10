const isEmpty = require('./is-empty');

function buildContext(variables, parameters) {
  if (isEmpty(variables) && isEmpty(parameters)) return {};

  return Object.assign({}, parameters, variables);
}

module.exports = buildContext;
