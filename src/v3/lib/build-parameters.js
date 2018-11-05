/* eslint-disable strict */

const buildInitialParameters = require('./parameters/build-initial-parameters');
const markLazyParameters = require('./parameters/mark-lazy-parameters');
const populateParameters = require('./parameters/populate-parameters');

function buildParameters(taskName, task, parameterDefinitions, taskArguments) {
  const initialParameters = buildInitialParameters(taskName, task.params, parameterDefinitions);
  const populatedParameters = populateParameters(initialParameters, taskArguments);
  
  return markLazyParameters(populatedParameters, task.actions);
}

module.exports = buildParameters;