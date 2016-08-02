'use strict';

const winston = require('winston');
winston.cli();

module.exports = class Logger {
  constructor(state) {
    this.state = state;
  }
  begin() {
    winston.info(`Begin task ${this.state.get('name')}`);
  }
  end() {
    winston.info(`End task ${this.state.get('name')}`);
  }
  fail(error) {
    winston.error(`Failed task ${this.state.get('name')} with error: ${error.message}`);
  }
  info(message) {
    winston.info(message);
  }
  error(error) {
    winston.error(error.message);
  }
};
