'use strict';

const winston = require('winston');

module.exports = winston.createLogger({
  format: winston.format.cli(),
  transports: [
    new winston.transports.Console()
  ]
});