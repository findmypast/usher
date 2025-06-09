'use strict';

const firstline = require('firstline');
const v2 = require('./v2/commands/list');
const listView = require('./list-view');
const kleur = require('kleur');
const Logger = require('./v2/loggers/default');
const { InvalidConfigError } = require('./v2/lib/errors');
const logger = new Logger();

function isV2(file) {
  return firstline(file).then(line => line.match(/version.*'2'/) || line.match(/version.*"2"/));
}

module.exports = (taskName, opts) => {
  function checkVersion(fileName) {
    return isV2(fileName)
      .then(result => {
        if (result) {
          return v2;
        }
        throw new InvalidConfigError("Only Usher file version: 2 is supported. Please ensure version is set to \'2\' in your usher file");
      })
  }

  return checkVersion(opts.file)
    .catch((e) => {
      if (e instanceof InvalidConfigError) {
        throw e;
      }
    })
    .then(list => list(taskName, opts))
    .then(tasksAndTheirDescriptions => {
      logger.info(kleur.bold(`Listing tasks under ${taskName ? taskName : (opts.file)}:`));
      listView(logger.info, tasksAndTheirDescriptions);
    });
};
