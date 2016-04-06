"use strict";

const yaml         = require('js-yaml');
const fs           = require('fs');
const _            = require('lodash')
const logger       = require('winston');
const factories    = require('../factories')
const settingKeys  = [
  "retry",
  "ignore_errors"
]

function parseOptions(options) {
  let path        = options.cmd.replace(" ", ".");
  let factory     = _.get(factories, path, false);
  let settings    = _.pick(options, settingKeys);
  let command     = _.omit(options, settingKeys);
  let makeCommand = (command, settings) => ({
    command:  command,
    settings: settings
  })

  if    (factory)  return makeCommand(factory(_.omit(command, 'cmd')), settings);
  else             return makeCommand(command.cmd, settings);
}

function parsePresets(options, name) {
  let fail = key => {
    logger.log('error', `Please define at least one "cmd" attribute for preset ${key}`);
    return false;
  }

  if      (!options)                return fail(name);
  else if (Array.isArray(options))  return options.map(parseOptions);
  else if (options.cmd)             return [parseOptions(options)];
  else                              return fail(name);
}

module.exports = filepath => {
  let rawPresets = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));

  return _.mapValues(rawPresets, parsePresets)
}
