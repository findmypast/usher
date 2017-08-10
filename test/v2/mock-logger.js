'use strict';

const Logger = class MockLogger {
  constructor(state) {
    this.state = state;
  }
  begin(...args) {
    Logger.begin(...args);
  }
  end(...args) {
    Logger.end(...args);
  }
  fail(...args) {
    Logger.fail(...args);
  }
  info(...args) {
    Logger.info(...args);
  }
  error(...args) {
    Logger.error(...args);
  }
};
Logger.begin = jest.fn();
Logger.end = jest.fn();
Logger.fail = jest.fn();
Logger.info = jest.fn();
Logger.error = jest.fn();

module.exports = Logger;
