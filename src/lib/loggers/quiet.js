'use strict';

const winston = require('winston');
winston.cli();

module.exports = class Logger {
  constructor(state) {
    this.state = state;
  }
  begin() {
    return null;
  }
  end() {
    return null;
  }
  fail(error) {
    winston.error(`Failed ${this.state.get('name')}: ${error.message}`);
  }
  info() {
    return null;
  }
  error(error) {
    winston.error(error.message);
  }
};
