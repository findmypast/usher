"use strict";

var parse = require('./parse');
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
  let result = spawnSync(command);
  console.log(`${command} exited with code ${result.status}`);
  return result;
}

function commandNotFound(preset) {
  console.log(`Failed to run ${preset}. Please see usage.`)
}

module.exports = preset => {
  let commandSequence = getCommandSequence(preset);

  if   (commandSequence)   runCommandSequence(commandSequence);
  else                     commandNotFound(preset);
}
