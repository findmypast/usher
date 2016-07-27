'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const exec = Promise.promisify(require('child_process').exec);

module.exports = (state, logger) => Promise.try(() => {
  const options = _.get(state, 'options', {});
  return exec(state.command, options);
});
