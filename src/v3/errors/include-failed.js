class IncludeFailedError extends Error {
  constructor(include) {
    super(`the include ${include} failed to install`);
  }
}

module.exports = IncludeFailedError;