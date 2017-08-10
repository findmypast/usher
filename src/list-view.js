'use strict';

const chalk = require('chalk');
const _ = require('lodash');

module.exports = (printFunction, list) => {
  var clonedList = _.cloneDeep(list);
  _.forOwn(clonedList, (values, key) => {
    printFunction(`${chalk.bold(key)}- ${values[0]}`);
    if (Array.isArray(values)) {
      values.shift();
      _.forEach(values, (value) => {
        printFunction(`- ${value}`);
      });
    }
  });
};
