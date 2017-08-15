'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const exec = require('child-process-promise').exec;
const spawn = require('child-process-promise').spawn;

const ACCEPTED_OPTIONS = [
  'cwd',
  'env',
  'shell',
  'timeout',
  'maxBuffer',
  'killSignal',
  'uid',
  'gid'
];

function reduceEnvArrayToObject(envs) {
  if (!_.isArray(envs)) {
    return envs;
  }

  return _.reduce(envs, (acc, e) => {
    const kvp = e.split('=');

    acc[kvp[0]] = kvp[1];

    return acc;
  }, {});
}

function execAndLog(state, options, resolve, reject) {
  const sanitisedCommand = state.get('command');
  if (!sanitisedCommand) {
    resolve();
  }
  const commandArgs = sanitisedCommand.split(' ').filter(arg => arg != '');
  const command = commandArgs.shift();
  const promise = spawn(command, commandArgs, options);
  var output = null;
  promise.childProcess.stdout.pipe(process.stdout);
  promise.childProcess.stderr.pipe(process.stderr);
  promise.childProcess.stdout.on('data', (data) => {
    output = data;
  });
  promise.childProcess.stderr.on('data', (data) => {
    output = data;
  });

  promise.childProcess.on('error', (e) => {
    state.logger.error(e);
    return e ? reject(e) : resolve(output);
  });

  promise.childProcess.on('exit', (code, signal) => {
    state.logger.error({message: `Task process exited with code ${code}`});
    return code ? reject({message: `Task exited with code ${code}`}) : resolve(output);
  });

  return promise.then(() => {
      resolve(output);
    })
    .catch((err) => {
      state.logger.error(err);
      reject(err);
    });
}

module.exports = (state) => new Promise((resolve, reject) => {
  const options = _.reduce(ACCEPTED_OPTIONS, (result, value) => _.set(result, value, state.get(value)), {});
  state.logger.info(`Executing: ${state.get('command')}`);
  options.env = reduceEnvArrayToObject(options.env);
  const copyOfProcessEnv = _.cloneDeep(process.env);
  const copyOfOptions = _.cloneDeep(options);
  copyOfOptions.env = Object.assign(copyOfProcessEnv, copyOfOptions.env);
  copyOfOptions.shell = true;

  if (copyOfOptions.env) {
    copyOfOptions.env['FORCE_COLOR'] = true; // Filthy hack to get colour output from certain npm modules
    copyOfOptions.env['NPM_CONFIG_COLOR'] = 'always'; // Filthy hack to get colour output from certain npm modules
    copyOfOptions.env['PYTHONIOENCODING'] = 'utf-8'; // Filthy hack to satistfy python environments which lose encoding when piping output
  }

  return execAndLog(state, copyOfOptions, resolve, reject);
});
