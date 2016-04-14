"use strict";

const _       = require('lodash');
const logger  = require('winston');
var parse     = require('./parse');
var spawnSync = require('child_process').spawnSync;

function getCommandSequence(preset, args, opts) {
  const usherFile = (opts && opts.filepath) ? opts.filepath : '.usher.yml';
  let parseFailed = () => {
    logger.log('error', "Failed to parse .usher.yml");
    return false;
  }
  let presetNotDefined = preset => {
    logger.log('error', `Preset ${preset} not in .usher.yml`);
    return false;
  }

  let commands = parse(usherFile);

  if      (!commands)        return parseFailed();
  else if (commands[preset]) return  _.map(commands[preset], command => expandTokens(command, args));
  else                       return presetNotDefined(preset);
}

function expandTokens(preset, args) {
  const template = _.template(preset.command);
  preset.command = template(args);
  return preset;
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
  let result = runProcess(...command);
  let isIgnoredError = code =>
    settings.ignore_errors.indexOf(result.status) !== -1;
  let retry  = () => {
    logger.log('info', `${command[0]} failed. Retry ${attempt}/${settings.retry.attempts - 1}`);
    return wrapAndRun(command, settings, attempt + 1);
  }

  if      ( result.status === 0 )               return result;
  else if ( settings.ignore_errors &&
            isIgnoredError(result.status) )     return result;
  else if ( settings.retry &&
            attempt < settings.retry.attempts ) return retry();
  else                                          throw result.error;
}

function runProcess(executable, args, processOptions) {
  logger.log('info', `Running ${executable}`);
  let result        = spawnSync(executable, args, processOptions);
  logger.log('info', `${executable} exited with code ${result.status}`);
  return result;
}

function commandNotFound(preset) {
  logger.log('error', `Could not find preset "${preset}". Please see usage.`)
}

module.exports = (preset, args, opts) => {
  const splitArgs = _.map(args, a => a.split('='));
  const parsedArgs = _.fromPairs(splitArgs);

  let commandSequence = getCommandSequence(preset, parsedArgs, opts);

  if   (commandSequence)   runCommandSequence(commandSequence);
  else                     commandNotFound(preset);
}
