/* eslint-disable strict */

const cp = require('child_process')
const path = require('path');
const _ = require('lodash');
const parseFile = require('../../lib/parse-file');
const TaskNotFoundError = require('../errors/task-not-found');
const validate = require('../schema/validate');

const taskNameRgx = /\s+.*/;

const actionHandlers = {
  shell: handleShellDependency,
  for: handleForDependency
};

function resolveDependencies (usherfile, taskName, moduleName = '.') {
  if (taskName == null) return null;
  
  const task = usherfile.tasks[taskName];
  if (task == null) throw new TaskNotFoundError(taskName);
  
  const resolver = createActionDependencyResolver(usherfile);
  const rawDependencies = task.actions.map(resolver);
  const nonNullDependencies = _.reject(rawDependencies, rejectNullDependency);
  const dependencies = _.uniqBy(nonNullDependencies, 'task');

  return { name: taskName, module: moduleName, task, dependencies };
}

module.exports = resolveDependencies;

function createActionDependencyResolver(usherfile) {
  return function (action) {
    const handler = actionHandlers[action.do] || handleTaskDependency;
    
    return handler(action, usherfile);
  }
}

function handleShellDependency() {
  return null;
}

function handleForDependency(action, usherfile) {
  const execTaskName = action.exec.replace(taskNameRgx, '');
  
  if (execTaskName.includes('.')) {
    //   install dependency
    const [moduleName, taskName] = execTaskName.split('.');
    //   recurse for task
    return resolveDependency(moduleName, taskName, usherfile);
  }

  return resolveDependencies(usherfile, execTaskName);
}

function handleTaskDependency(action, usherfile) {
  const doTaskName = action.do.replace(taskNameRgx, '');
    
  if (doTaskName.includes('.')) {
    //   install dependency
    const [moduleName, taskName] = doTaskName.split('.');
    //   recurse for task
    return resolveDependency(moduleName, taskName, usherfile);
  }

  return resolveDependencies(usherfile, doTaskName);
}

function rejectNullDependency(dependency) {
  return dependency == null;
}

function resolveDependency(moduleName, taskName, usherfile) {
  const includes = usherfile.includes;
  if (includes == null) return null;

  const include = includes[moduleName];
  if (include == null) return null;
  
  if (isRemoteDependency(include)) {
    return resolveRemoteDependency(include, moduleName, taskName)
  }

  return resolveRelativeDependency(include, moduleName, taskName)
}

function isRemoteDependency(include) {
  return !/.ya?ml$/.test(include.from);
}

function installDir() {
  const homeDirEnvKey = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
  const homeDir = process.env[homeDirEnvKey];

  return `${homeDir}/.usher-cli`;
}

function resolveRemoteDependency(include, moduleName, taskName) {
  const cwd = installDir();
  cp.execSync(`npm install ${include.from} --prefix ${cwd}`);
  const dependency = require(`${cwd}/node_modules/${moduleName}`);

  return resolveDependencies(dependency, taskName, moduleName);
}

function resolveRelativeDependency(include, moduleName, taskName) {
  const filepath = path.resolve(include.from);
  const dependency = parseFile(filepath);
  validate(dependency);

  return resolveDependencies(dependency, taskName, moduleName);
}
