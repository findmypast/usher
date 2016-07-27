'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const exec = Promise.promisify(require('child_process').exec);

const ACCEPTED_OPTIONS = [
  'cwd',
  'env',
  'shell',
  'timeout',
  'maxBuffer',
  'killSignal',
  'uid',
  'gid'
];

module.exports = (state, logger) => Promise.try(() => {
  const options = _.pick(state, ACCEPTED_OPTIONS);
  return exec(state.command, options)
    .then(output => {
      logger.info(state, output);
      return output;
    });
});
