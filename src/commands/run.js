"use strict";

const _       = require('lodash');
var parse     = require('./parse');
var spawnSync = require('child_process').spawnSync;

function getCommandSequence(preset) {
  let parseFailed = () => {
    console.log("Failed to parse .usher.yml");
    return false;
  }
  let presetNotDefined = preset => {
    console.log(`Preset ${preset} not in .usher.yml`);
    return false;
  }

  let commands = parse('.usher.yml');

  if      (!commands)        return parseFailed();
  else if (commands[preset]) return commands[preset];
  else                       return presetNotDefined(preset);
}

function runCommandSequence(commandSequence) {
  commandSequence.forEach( command => runCommand(command) );
}

function runCommand(command) {
  console.log(`Running ${command}`);
  let commandArray  = command.split(" ");
  let executable    = _.head(commandArray);
  let args          = _.tail(commandArray);
  let options       = {
    stdio:  ['pipe', 'inherit', 'inherit']
  };
  let result        = spawnSync(executable, args, options);
  console.log(`${command} exited with code ${result.status}`);
  if (result.error) throw result.error;
  return result;
}

function commandNotFound(preset) {
  console.log(`Could not find preset "${preset}". Please see usage.`)
}

module.exports = preset => {
  let commandSequence = getCommandSequence(preset);

  if   (commandSequence)   runCommandSequence(commandSequence);
  else                     commandNotFound(preset);
}
