/* eslint-disable strict */

const _ = require('lodash');
const TaskNotFoundError = require('../errors/task-not-found');

const taskNameRgx = /\s+.*/;

const actionHandlers = {
  shell: handleShellDependency,
  for: handleForDependency
};

function resolveDependencies (usherfile, taskName) {
  if (taskName == null) return null;

  const resolver = createActionDependencyResolver(usherfile);

  const task = usherfile.tasks[taskName];
  if (task == null) throw new TaskNotFoundError(taskName);

  const rawDependencies = task.actions.map(resolver);
  const nonNullDependencies = _.reject(rawDependencies, rejectNullDependency);
  const dependencies = _.uniqBy(nonNullDependencies, 'task');

  return { task: taskName, dependencies };
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
    //   recurse for task
    return null;
  }

  return resolveDependencies(usherfile, execTaskName);
}

function handleTaskDependency(action, usherfile) {
  const doTaskName = action.do.replace(taskNameRgx, '');
    
  if (doTaskName.includes('.')) {
    //   install dependency
    //   recurse for task
    return null;
  }

  return resolveDependencies(usherfile, doTaskName);
}

function rejectNullDependency(dependency) {
  return dependency == null;
}
