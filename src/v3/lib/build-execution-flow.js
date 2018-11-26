/* eslint-disable strict */

const _ = require('lodash');

function buildExecutionFlow(dependencyNode) {
  if (noDependenciesAndParallel(dependencyNode)) {
    return [dependencyNode.task.actions];
  }

  if (noDependencies(dependencyNode)) {
    return dependencyNode.task.actions;
  }

  const actionToExecutable = createActionToExecutable(dependencyNode.dependencies);
  const executionFlow = dependencyNode.task.actions.map(actionToExecutable);

  return _.flatten(executionFlow);
}

module.exports = buildExecutionFlow;

function noDependencies(dependencyNode) {
  return dependencyNode.dependencies.length === 0;
}

function noDependenciesAndParallel(dependencyNode) {
  return noDependencies(dependencyNode) && dependencyNode.task.parallel;
}

function createActionToExecutable(dependencies) {
  return function(action) {
    // if action is a shell command, no further dependencies so return action
    if (action.do === 'shell') return action;

    const [moduleName, taskName] = extractTaskAndModuleNames(action);
    const findDependency = createFindDependency(moduleName, taskName);
    const dependency = dependencies.find(findDependency);

    return buildExecutionFlow(dependency);
  };
}

function extractTaskAndModuleNames(action) {
  return /\./.test(action.do) ? action.do.split('.') : ['.', action.do];
}

function createFindDependency(moduleName, taskName) {
  return function({ module, name }) {
    return module === moduleName && name === taskName;
  };
}