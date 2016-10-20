'use strict';

function isWindows(platform) {
  return platform === 'win32';
}

function homeDirEnvKey(isWin32Platform) {
  return isWin32Platform ? 'USERPROFILE' : 'HOME';
}

function fromEnvironment(environment, key) {
  return environment[key];
}

function installedModulesDir() {
  return '/.usher-cli';
}

function appendInstalledModulesDir(dir) {
  return `${dir}${installedModulesDir()}`;
}

module.exports = {
  installDir: (usherProcess = process) => {
    const isWin32 = isWindows(usherProcess.platform);
    const homeDirectory = fromEnvironment(usherProcess.env, homeDirEnvKey(isWin32));
    return appendInstalledModulesDir(homeDirectory);
  }
};
