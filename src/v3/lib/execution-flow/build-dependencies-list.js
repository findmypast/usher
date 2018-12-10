const _ = require('lodash');

function buildDependenciesList(node) {
  const rawDependencies = extractDependencies(node);
  const flatDependencies = _.flattenDeep(rawDependencies);
  const nonEmptyDependencies = _.reject(flatDependencies, emptyDependency);
  
  return _.uniqBy(nonEmptyDependencies, usageName);
}

module.exports = buildDependenciesList;

function extractDependencies(node) {
  return node.dependencies.map(extractDependencies).concat(node.dependencies);
}

function emptyDependency(dependency) {
  return Array.isArray(dependency) && dependency.length === 0;
}

function usageName(dependency) {
  return `${dependency.module}.${dependency.name}`;
}