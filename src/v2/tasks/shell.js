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

module.exports = (state) => Promise.try(() => {
  const options = _.pick(state, ACCEPTED_OPTIONS);
  return exec(state.get('command'), options)
    .then(output => {
      state.logger.info(output);
      return output;
    });
});
