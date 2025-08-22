'use strict';
const winston = require('../../winston');

const HEAVY_MULTIPLICATION_SYMBOL = '\u{2716}';

module.exports = class Logger {
  constructor(state) {
    this.state = state;
  }
  logTask(name, description, attempt, tries) {
    const retries = attempt > 1 ? `| retrying ${attempt}/${tries}` : '';
    const suffix = description ? `| ${description}` : '';
    winston.info(`Running ${name} ${suffix} ${retries}`);
  }
  begin(attempt, tries) {
    this.logTask(this.state.get('name'), this.state.get('description'), attempt, tries);
  }
  end() {
    winston.info(`Completed ${this.state.get('name')}`);
  }
  fail(error) {
    winston.error(`${HEAVY_MULTIPLICATION_SYMBOL} Failed ${this.state.get('name')}`);
    if (this.errors) {
      const lines = this.errors.trim().split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        winston.error(lines[i]);
      }
    }
  }
  info(message) {
    winston.info(message);
  }
  error(error) {
    winston.error(error.message);
  }
};
