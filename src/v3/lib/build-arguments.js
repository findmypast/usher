/* eslint-disable strict */

function buildArguments(taskArgs) {
  return taskArgs.reduce(reduceArgument, {});
}

module.exports = buildArguments;

function reduceArgument(args, taskArgs) {
  const [key, ...values] = taskArgs.split('=');
  const value = values.join('=');

  return Object.assign({}, args, { [key]: value });
}