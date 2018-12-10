class UndeclaredParameterError extends Error {
  constructor(undeclaredParameter, task) {
    super(`the parameter ${undeclaredParameter} used by task ${task} was not declared.`);
  }
}

module.exports = UndeclaredParameterError;