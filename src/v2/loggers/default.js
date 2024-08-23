'use strict';

const winston = require('../../winston');

const GEAR_SYMBOL = '\u{2699}';
const HEAVY_CHECKMARK_SYMBOL = '\u{2714}';
const HEAVY_MULTIPLICATION_SYMBOL = '\u{2716}';

module.exports = class Logger {
  constructor(state) {
    this.state = state;
    this.tasks = [];
    this.errors = '';
  }
  logTask(name, description, attempt, tries) {
    const retries = attempt > 1 ? `| retrying ${attempt}/${tries}` : '';
    const suffix = description ? `| ${description}` : '';
    winston.info(`${GEAR_SYMBOL} Running ${name} ${suffix} ${retries}`);
  }

  begin(attempt, tries) {
    this.tasks.push({
      id: this.state.get('id'),
      name: this.state.get('name')
    });
    this.logTask(this.tasks[0].name, this.state.get('description'), attempt, tries);
  }
  end() {
    if (this.tasks.length === 1) {
      winston.info(`${HEAVY_CHECKMARK_SYMBOL} Completed ${this.tasks[0].name}`);
    }
    this.tasks.pop();
  }
  fail(error, attempt, tries) {
    // This is confusing as when there is a final task 
    // the logs would not show as the this.tasks length is increased 
    if (this.tasks.length === 1 && attempt === tries) {
      winston.error(`${HEAVY_MULTIPLICATION_SYMBOL} Failed ${this.tasks[0].name}`);
      // Don't log any error message as the run.js catch will capture final error that broke the run.
    }
    this.tasks.pop();
  }
  info(message) {
    winston.info(message);
  }
  error(error) {
    winston.error(error.message);
  }
};
