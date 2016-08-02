'use strict';

const winston = require('winston');
winston.cli();

module.exports = {
  task: {
    begin: state => winston.info(`Begin task ${state.get('name')}`),
    end: state => winston.info(`End task ${state.get('name')}`),
    fail: (state, error) => winston.error(`Failed task ${state.get('name')} with error: ${error.message}`)
  },
  info: winston.info,
  error: error => winston.error(error.message)
};
