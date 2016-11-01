'use strict';

const firstline = require('firstline');
const v1 = require('./v1/list');
const v2 = require('./v2/commands/list');

function isV2(file) {
  return firstline(file).then(line => line.match(/version.*'2'/));
}

function checkVersion(fileName) {
  return isV2(fileName)
  .then(result => {
    if (result) {
      return v2;
    }
    return v1;
  });
}

module.exports = (taskName, opts) => {
  return checkVersion(opts.file)
    .catch(() => checkVersion('.usher.yml'))
    .then(list => list(taskName, opts));
};
