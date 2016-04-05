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

function runCommand(commandWithSettings) {
  let command         = commandWithSettings.command;
  let settings        = commandWithSettings.settings;
  let commandArray    = command.split(" ");
  let executable      = _.head(commandArray);
  let args            = _.tail(commandArray);
  let processOptions  = {
    stdio:  ['pipe', 'inherit', 'inherit']
  };

  return wrapAndRun([executable, args, processOptions], settings, 1);
}

function wrapAndRun(command, settings, attempt) {
  try {
    return runProcess(...command);
  }
  catch(error) {
    if(settings.retry && attempt < settings.retry.attempts) {
      console.log(`${command.executable} failed. Retry ${attempt}/${settings.retry.attempts - 1}`);
      return wrapAndRun(command, settings, attempt + 1);
    }
    else throw error;
  }
}

function runProcess(executable, args, processOptions) {
  console.log(`Running ${executable}`);
  let result        = spawnSync(executable, args, processOptions);
  console.log(`${executable} exited with code ${result.status}`);
  if (result.error) throw result.error;
}

function commandNotFound(preset) {
  console.log(`Could not find preset "${preset}". Please see usage.`)
}

module.exports = preset => {
  let commandSequence = getCommandSequence(preset);

  if   (commandSequence)   runCommandSequence(commandSequence);
  else                     commandNotFound(preset);
}
