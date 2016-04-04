"use strict";

var yaml = require('js-yaml');
var fs = require('fs');
var _ = require('lodash')
var factories = require('../factories')

module.exports = filepath => {
  var rawCommandSet = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
  return _.mapValues(rawCommandSet, commands =>
    commands.map(command => {
      let path = command.cmd.replace(" ", ".");
      let factory = _.get(factories, path, false);
      if(factory) return factory(_.omit(command, 'cmd'));
      else return command.cmd;
    })
  )
}
