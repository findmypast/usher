"use strict";

const _ = require('lodash');

module.exports = (executable, options, optionMap, target) => {
  let optionString = _.map(options, (value, key) => {
    if(!_.has(optionMap, key))  throw new Error(`Cannot find ${key} in optionBuilders`);
    else                        return optionMap[key](value);
  }).join(" ");

  if(optionString == "") return _.trim(`${executable} ${target}`);
  return _.trim(`${executable} ${optionString} ${target}`);
};
