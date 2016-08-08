'use strict';

const firstline = require('firstline');
const v1 = require('./v1/list');
const v2 = require('./v2/commands/list');

function isV2(file) {
  return firstline(file).then(line => line.match(/version.*'2'/));
}

module.exports = (taskName, opts) => {
  function checkVersion(fileName) {
    return isV2(fileName)
    .then(result => {
      if (result) {
        return v2;
      }
      return v1;
    });
  }
  if (opts.file) {
    return checkVersion(opts.file);
  }
  return checkVersion('usher.yml')
  .catch(() => checkVersion('.usher.yml'))
  .then(list => list(taskName, opts));
};
