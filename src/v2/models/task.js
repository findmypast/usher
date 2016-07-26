'use strict';

const Promise = require('bluebird');

class Task {
  constructor(name, description, options) {
    this.name = name;
    this.description = description || 'No description set';
    this.options = options || {};
  }
  exec(args, logger) {
    return new Promise( (resolve) => resolve() );
  }
  validate(args, logger) {
    return new Promise( (resolve) => resolve() );
  }
}

module.exports = Task;
