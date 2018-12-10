class RequiredParameterError extends Error {
  constructor(params, task) {
    super(`the required parameter(s) ${params.join(', ')} were not supplied to task ${task}.`);
  }
}

module.exports = RequiredParameterError;