'use strict';

const usherTransport = require('./transport');

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
    usherTransport.error(`Failed ${this.state.get('name')}: ${error.message}`);
  }
  info() {
    return null;
  }
  error(error) {
    usherTransport.error(error.message);
  }
};
