'use strict';

const usherTransport = require('./transport');

module.exports = class Logger {
  constructor(state) {
    this.state = state;
  }
  logTask(name, description, attempt, tries) {
    const retries = attempt > 1 ? `| retrying ${attempt}/${tries}` : '';
    const suffix = description ? `| ${description}` : '';
    usherTransport.info(`Running ${name} ${suffix} ${retries}`);
  }
  begin(attempt, tries) {
    this.logTask(this.state.get('name'), this.state.get('description'), attempt, tries);
  }
  end() {
    usherTransport.info(`Completed ${this.state.get('name')}`);
  }
  fail(error) {
    usherTransport.error(`Failed ${this.state.get('name')}: ${error.message}`);
  }
  info(message) {
    usherTransport.info(message);
  }
  error(error) {
    usherTransport.error(error.message);
  }
};
