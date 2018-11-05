/* eslint-disable strict */

class InvalidConfigError extends Error {
  constructor(message) {
    super(`Error in configuration:\n${message}.\nPlease check your config file.`);
  }
}

module.exports = InvalidConfigError;