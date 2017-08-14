'use strict';

var winston = require('winston');
const chalk = require('chalk');

const levels = {
  info: () => {
    return chalk.bold(chalk.green('> '))
  },
  warn: () => {
    return chalk.bold(chalk.yellow('> '))
  },
  error: () => {
    return chalk.bold(chalk.red('> '))
  }
};

winston.loggers.add('usher', {
  transports: [
    new (winston.transports.Console)({
      formatter: function(options) {
        var msg = '';
        if(options.message) {
          msg += levels[options.level]() + options.message;
        }
        return msg +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
    })
  ]
});

module.exports = winston.loggers.get('usher');
