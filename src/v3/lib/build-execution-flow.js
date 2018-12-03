/* eslint-disable strict */

const buildDependenciesList = require('./execution-flow/build-dependencies-list');
const findDependency = require('./execution-flow/find-dependency');
const { isNotResolved, isResolved } = require('./execution-flow/resolved-status');

function buildExecutionFlow(dependencyNode) {
  const dependencies = buildDependenciesList(dependencyNode);
  const executionFlow = dependencyNode.task.actions;

  while (isNotResolved(executionFlow)) {
    for (let i = 0; i < executionFlow.length; i++) {
      const item = executionFlow[i];

      if (isResolved(item)) continue;

      if (Array.isArray(item)) {
        for (let j = 0; j < item.length; j++) {
          if (isResolved(item[j])) continue;

          const dependency = findDependency(item[j], dependencies);
          const { task: { actions, parallel } } = dependency;

          if (parallel) { executionFlow[i].splice(j, 1, actions); }     // if dependency is parallel, insert array of actions
          else          { executionFlow[i].splice(j, 1, ...actions); }  // else, insert sequence of actions
        }

        continue;
      }

      const dependency = findDependency(item, dependencies);
      const { task: { actions, parallel } } = dependency;

      if (parallel) { executionFlow.splice(i, 1, actions); }      // if dependency is parallel, insert array of actions
      else          { executionFlow.splice(i, 1, ...actions); }   // else, insert sequence of actions
    }
  }

  return dependencyNode.task.parallel ? [ executionFlow ] : executionFlow;
}

module.exports = buildExecutionFlow;
