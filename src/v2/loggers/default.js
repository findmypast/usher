'use strict';

const emoji = require('node-emoji').emoji;
const usherTransport = require('./transport');

module.exports = class Logger {
  constructor(state) {
    this.state = state;
    this.tasks = [];
  }
  logTask(name, description, attempt, tries) {
    const retries = attempt > 1 ? `| retrying ${attempt}/${tries}` : '';
    const suffix = description ? `| ${description}` : '';
    usherTransport.info(`${emoji.gear} Running ${name} ${suffix} ${retries}`);
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
      usherTransport.info(`${emoji.heavy_check_mark} Completed ${this.tasks[0].name}`);
    }
    this.tasks.pop();
  }
  fail(error, attempt, tries) {
    if (this.tasks.length === 1 && attempt === tries) {
      usherTransport.error(`${emoji.heavy_multiplication_x} Failed ${this.tasks[0].name}: ${error.message}`);
    }
    this.tasks.pop();
  }
  info(message) {
    usherTransport.info(message);
  }
  warn(message) {
    usherTransport.warn(message);
  }
  error(error) {
    usherTransport.error(error.message);
  }
};
