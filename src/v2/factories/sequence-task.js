'use strict';

// const Promise = require('bluebird');
const Task = require('../models/task');

module.exports = spec => {
  return class SequenceTask extends Task {
    constructor(args, Logger) {
      super(args, Logger);
    }
  };
};
