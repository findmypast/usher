'use strict';

const firstline = require('firstline');
const v1 = require('./v1/run');
const v2 = require('./v2/commands/run');

function isV2(file) {
  return firstline(file).then(line => line.match(/version.*'2'/));
}

module.exports = (taskName, taskVars, opts) => {
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
  .then(run => run(taskName, taskVars, opts));
};
