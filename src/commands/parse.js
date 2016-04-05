"use strict";

const yaml = require('js-yaml');
const fs = require('fs');
const _ = require('lodash')
const factories = require('../factories')

function parseOptions(command) {
  let path = command.cmd.replace(" ", ".");
  let factory = _.get(factories, path, false);

  if    (factory)  return factory(_.omit(command, 'cmd'));
  else             return command.cmd;
}

function parsePresets(options, name) {
  let fail = key => {
    console.log(`Please define at least one "cmd" attribute for preset ${key}`);
    return false;
  }

  if      (!options)                return fail(name);
  else if (Array.isArray(options))  return options.map(parseOptions);
  else if (options.cmd)             return parseOptions(options);
  else                              return fail(name);
}

module.exports = filepath => {
  let rawPresets = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));

  return _.mapValues(rawPresets, parsePresets)
}
