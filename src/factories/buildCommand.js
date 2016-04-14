"use strict";

const _ = require('lodash');

module.exports = function(executable, options, optionMap) {
  let optionString = _.map(options, (value, key) => {
    if(!_.has(optionMap, key))  throw new Error(`Cannot find ${key} in optionBuilders`);
    else                        return optionMap[key](value);
  }).join(" ");

  const restOfArgs = _.drop(Array.prototype.slice.call(arguments), 3).join(' ');

  if(optionString == "") return _.trim(`${executable} ${restOfArgs}`);
  return _.trim(`${executable} ${optionString} ${restOfArgs}`);
};
