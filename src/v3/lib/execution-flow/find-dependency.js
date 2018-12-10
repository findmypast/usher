function findDependency(executable, dependencies) {
  const [moduleName, taskName] = extractModuleAndTaskNames(executable);
  const dependencyFinder = createFindDependency(moduleName, taskName);

  return dependencies.find(dependencyFinder);
}

module.exports = findDependency;

function extractModuleAndTaskNames(action) {
  return /\./.test(action.do) ? action.do.split('.') : ['.', action.do];
}

function createFindDependency(moduleName, taskName) {
  return function({ module, name }) {
    return module === moduleName && name === taskName;
  };
}