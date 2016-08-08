/* global sandbox */
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
Logger.begin = sandbox.stub();
Logger.end = sandbox.stub();
Logger.fail = sandbox.stub();
Logger.info = sandbox.stub();
Logger.error = sandbox.stub();

module.exports = {
  Logger: Logger
};
