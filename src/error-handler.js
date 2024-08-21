'use strict';

const winston = require('./winston');

module.exports = fn =>
  (...args) =>
    fn(...args)
    .catch((e) => {
      winston.error('ERROR: ' + e.message.split('\n')[0]);
      process.exit(1);
    });
