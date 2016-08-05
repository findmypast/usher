'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const exec = require('child_process').exec;

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

module.exports = (state) => new Promise((resolve, reject) => {
  const options = _.reduce(ACCEPTED_OPTIONS, (result, value) => _.set(result, value, state.get(value)), {});
  exec(state.get('command'), options, (err, stdout) => {
    state.logger.info(stdout);
    if (err) {
      reject(err);
    }
    resolve(stdout);
  });
});
