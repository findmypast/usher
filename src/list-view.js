'use strict';

const kleur = require('kleur');

const _ = require('lodash');

module.exports = (printFunction, list) => {
  var clonedList = _.cloneDeep(list);
  _.forOwn(clonedList, (values, key) => {
    printFunction(`${kleur.bold(key)}- ${values[0]}`);
    if (Array.isArray(values)) {
      values.shift();
      _.forEach(values, (value) => {
        printFunction(`- ${value}`);
      });
    }
  });
};
