class UnusedArgumentError extends Error {
  constructor(unusedArgument, task) {
    super(`the argument ${unusedArgument} supplied to task ${task} is not used.`);
  }
}

module.exports = UnusedArgumentError;