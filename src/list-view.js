'use strict';

const chalk = require('chalk');
const _ = require('lodash');

function padded(word, desiredLength) {
  while (word.length < desiredLength+8) {
    word += ' ';
  }
  return word;
}
module.exports = (printFunction, list) => {
  var clonedList = _.cloneDeep(list);
  var keys = [];
  var longestWord = 0;
  _.forOwn(clonedList, (values, key) => {
    longestWord = key.length > longestWord ? key.length : longestWord;
    keys.push(key);
  });
  keys.sort();

  for (var key = 0; key < keys.length; key++) {
    printFunction(`${padded(chalk.bold(keys[key]), longestWord)}\t-\t${clonedList[keys[key]][0]}`);
    if (Array.isArray(clonedList[keys[key]])) {
      clonedList[keys[key]].shift();
      _.forEach(clonedList[keys[key]], (value) => {
        printFunction(`${padded('', keys[key].length)}\t-\t${value}`);
      });
    }
  }
};
