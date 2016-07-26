'use strict';

const Promise = require('bluebird');
const uuid = require('uuid').v4;

class Task {
  constructor(args, Logger) {
    this.name = args.name || 'UNNAMED';
    this.id = uuid();
    this.description = args.description || '';
    this.options = args.options || {};
    this.state = args.state || {};
    this.logger = new Logger(this);
  }
  exec() {
    return new Promise( (resolve) => {
      this.logger.begin();
      this.logger.end();
      resolve();
    } );
  }
  validate() {
    return new Promise( (resolve) => resolve() );
  }
}

module.exports = Task;
