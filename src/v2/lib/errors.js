'use strict';

module.exports = {
  TaskNotFoundError: class extends Error {
    constructor(task) {
      super(`Task ${task} not found. Check it is declared or included.`);
    }
  },
  TaskFailedError: class extends Error {
    constructor(error, state) {
      super(`Task ${state.get('name')} failed with ${error.message}.`);
    }
  }
};
