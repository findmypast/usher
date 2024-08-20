'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const { exec, execSync } = require('child_process');
const split = require('split');

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

function execAndLog(state, options, resolve, reject, prefix) {
  // const child = exec(state.get('command'), options, (error, stdout) => {
  //   if (error) {
  //     reject(error);
  //   }
  //   resolve(stdout);
  // });
  const child = exec(`${state.get("command")} 2>&1`, options, (error, stderr, stdout) => {
    if (error) {
      reject(error);
    }
    resolve(stdout);
  });

  child.stdout.pipe(split()).on('data', data => {
    if (data) {
      state.logger.info(`${prefix}${data.toString()}`);
    }
  });

  child.stderr.pipe(split()).on('data', data => {
    if (data) {
      state.logger.error({ message: `${prefix}${data.toString()}` });
    }
  });

  child.on('exit', code => {
    state.logger.info(`${prefix}Task ${state.get('command')} exited with code ${code}`);
  });
}

function spawnInteractive(state, options, resolve, reject) {
  const spawn = require('child_process').spawn;
  const sanitisedCommand = state.get('command').replace(/[ ]{2,}/g, ' ');
  const commandArgs = sanitisedCommand.split(' ');
  const command = commandArgs.shift();
  const cmd = spawn(command, commandArgs, Object.assign(options, { stdio: 'inherit' }));

  cmd.on('close', code => {
    return code ? reject(code) : resolve();
  });
}

function getLogPrefix(state) {
  const logPrefix = state.get('log_prefix') || '';

  return logPrefix ? `${logPrefix}: ` : logPrefix;
}

module.exports = state => new Promise((resolve, reject) => {
  const logPrefix = getLogPrefix(state);
  const options = _.reduce(ACCEPTED_OPTIONS, (result, value) => _.set(result, value, state.get(value)), {});

  state.logger.info(`${logPrefix} Executing: ${state.get('command')}`);

  options.env = reduceEnvArrayToObject(options.env);
  const copyOfProcessEnv = _.cloneDeep(process.env);
  const copyOfOptions = _.cloneDeep(options);

  copyOfOptions.env = Object.assign(copyOfProcessEnv, copyOfOptions.env);

  if (copyOfOptions.env) {
    copyOfOptions.env['FORCE_COLOR'] = true; // Filthy hack to get colour output from certain npm modules
    copyOfOptions.env['NPM_CONFIG_COLOR'] = 'always'; // Filthy hack to get colour output from certain npm modules
    copyOfOptions.env['PYTHONIOENCODING'] = 'utf-8'; // Filthy hack to satistfy python environments which lose encoding when piping output
  }

  const isInteractiveShell = state.get('options') ? state.get('options').interactive : false;

  return isInteractiveShell
    ? spawnInteractive(state, copyOfOptions, resolve, reject)
    : execAndLog(state, copyOfOptions, resolve, reject, logPrefix);
});
