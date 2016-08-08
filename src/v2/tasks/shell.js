'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const exec = require('child_process').exec;
const split = require('split');

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
  const child = exec(state.get('command'), options, (err, stdout) => {
    if (err) {
      reject(err);
    }
    resolve(stdout);
  });
  child.stdout
    .pipe(split())
    .on('data', line => {
      if (line) {
        state.logger.info(line);
      }
    });
  child.stderr
    .pipe(split())
    .on('data', line => {
      if (line) {
        state.logger.error(line);
      }
    });
});
