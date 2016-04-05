"use strict";

var yaml = require('js-yaml');
var fs = require('fs');
var _ = require('lodash')
var factories = require('../factories')

function parseCommand(command) {
  var path = command.cmd.replace(" ", ".");
  var factory = _.get(factories, path, false);
  if(factory) return factory(_.omit(command, 'cmd'));
  else return command.cmd;
}

module.exports = filepath => {
  var rawPresets = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
  return _.mapValues(rawPresets, (commands, key) => {
    if (Array.isArray(commands)) return commands.map(parseCommand);
    if (commands.cmd) return parseCommand(commands);
    console.log(`Please define at least one "cmd" attribute for preset ${key}`);
    return false;
  })
}
