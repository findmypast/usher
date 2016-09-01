'use strict';

const _ = require('lodash');

module.exports = (config) => {
  return _.values(_.pick(config.vars, config.hide_vars));
};
