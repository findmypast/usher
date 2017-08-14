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
  const commandArgs = sanitisedCommand.split(' ');
  const command = commandArgs.shift();
  const promise = spawn(command, commandArgs, options);

  promise.childProcess.on('error', (e) => {
    state.logger.error(e);
    return code ? reject(e) : resolve();
  });

  promise.childProcess.on('exit', (code) => {
    state.logger.error({message: `Task process exited with code ${code}`});
    return code ? reject({message: `Task exited with code ${code}`}) : resolve();
  });

  return promise.then((something) => {
      resolve(something);
    })
    .catch((err) => {
      state.logger.error('[spawn] ERROR: ', err);
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
  copyOfOptions.stdio = 'inherit';

  if (copyOfOptions.env) {
    copyOfOptions.env['FORCE_COLOR'] = true; // Filthy hack to get colour output from certain npm modules
    copyOfOptions.env['NPM_CONFIG_COLOR'] = 'always'; // Filthy hack to get colour output from certain npm modules
    copyOfOptions.env['PYTHONIOENCODING'] = 'utf-8'; // Filthy hack to satistfy python environments which lose encoding when piping output
  }

  return execAndLog(state, copyOfOptions, resolve, reject);
});
