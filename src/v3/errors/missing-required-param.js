/* eslint-disable strict */

class MissingRequiredParameterError extends Error {
  constructor(missingParams, task) {
    super(`the parameter(s) ${missingParams.join()} were not supplied to task ${task}.`);
  }
}

module.exports = MissingRequiredParameterError;