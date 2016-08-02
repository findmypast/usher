'use strict';

const winston = require('winston');
winston.cli();

module.exports = class Logger {
  constructor(state) {
    this.state = state;
    this.tasks = [];
  }
  logTask(name, description, attempt, tries) {
    const retries = attempt > 1 ? `| retrying ${attempt}/${tries}` : '';
    const suffix = description ? `| ${description}` : '';
    winston.info(`Running ${name} ${suffix} ${retries}`);
  }
  begin(attempt, tries) {
    this.tasks.push({
      id: this.state.get('id'),
      name: this.state.get('name')
    });
    this.logTask(this.tasks[0].name, this.state.get('description'), attempt, tries);
  }
  end() {
    winston.info(`Completed ${this.tasks[0].name}`);
    this.tasks.pop();
  }
  fail(error) {
    winston.error(`Failed ${this.tasks[0].name}: ${error.message}`);
    this.tasks.pop();
  }
  info(message) {
    winston.info(message);
  }
  error(error) {
    winston.error(error.message);
  }
};
