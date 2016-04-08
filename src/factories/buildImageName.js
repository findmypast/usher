"use strict";

const _ = require('lodash');

const optionMap = {
  registry: value => `${value}/`,
  image: value => `${value}`,
  tag: value => `:${value}`
};

module.exports = (config) => {
  let options = _.pick(config, 'registry', 'image', 'tag');
  let optionString = _.map(options, (value, key) => {
    if(!_.has(optionMap, key))  throw new Error(`Cannot find ${key} in optionBuilders`);
    else                        return optionMap[key](value);
  }).join('');
  return optionString;
};
