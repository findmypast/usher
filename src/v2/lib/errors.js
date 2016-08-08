'use strict';

module.exports = {
  TaskNotFoundError: class extends Error {
    constructor(task) {
      super(`Task ${task} not found. Check it is declared or included.`);
    }
  },
  InvalidConfigError: class extends Error {
    constructor(message) {
      super(`Error in configuration: ${message}. Please check your config file.`);
    }
  },
  ParsingError: class extends Error {
    constructor(error, file) {
      super(`Error parsing ${file}: ${error.message}`);
    }
  }
};
