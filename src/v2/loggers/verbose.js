'use strict';

const winston = require('winston');
winston.cli();

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
    winston.error(`Failed ${this.state.get('name')}: ${error.message}`);
  }
  info(message) {
    winston.info(message);
  }
  error(error) {
    winston.error(error.message);
  }
};
