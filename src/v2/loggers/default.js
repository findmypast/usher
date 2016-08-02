'use strict';

const flickerlog = require('flickerlog');
const log = flickerlog.log;
const flicker = flickerlog.flicker;
const emoji = require('node-emoji').emoji;

module.exports = class Logger {
  constructor(state) {
    this.state = state;
    this.tasks = [];
    this.errors = '';
  }
  logTask(name, description, attempt, tries) {
    const retries = attempt > 1 ? `| retrying ${attempt}/${tries}` : '';
    const suffix = description ? `| ${description}` : '';
    flicker(`${emoji.gear} Running ${name} ${suffix} ${retries}`);
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
      log(`${emoji.heavy_check_mark} Completed ${this.tasks[0].name}`);
      this.tasks.pop();
    }
  }
  fail(error, attempt, tries) {
    if (this.tasks.length === 1 && attempt === tries) {
      console.error(`${emoji.heavy_multiplication_x} Failed ${this.tasks[0].name}: ${error.message}`);
      console.error(this.errors);
    }
    this.tasks.pop();
  }
  info() {}
  error(error) {
    this.errors.concat(error.message + '\n');
  }
};
