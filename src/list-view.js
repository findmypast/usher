'use strict';

const chalk = require('chalk');
const _ = require('lodash');

module.exports = (printFunction, list) => {
  _.forOwn(list, (values, key) => {
    printFunction(`${chalk.bold(key)}- ${values[0]}`);
    values.shift();
    _.forEach(values, (value) => {
      printFunction(`- ${value}`);
    });
  });
};
