'use strict';

const firstline = require('firstline');
const v2 = require('./v2/commands/run');
const { InvalidConfigError } = require('./v2/lib/errors');

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
        throw new InvalidConfigError("Only Usher file version: 2 is supported. Ensure version is set to \'2\' in your usher file");
      });
  }

  return checkVersion(opts.file)
    .catch((e) => {
      if (e instanceof InvalidConfigError) {
        throw e;
      }
    })
    .then(run => run(taskName, taskVars, opts));
};
