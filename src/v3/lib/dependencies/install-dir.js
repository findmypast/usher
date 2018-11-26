function installDir() {
  const homeDirEnvKey = process.platform === 'win32' ? 'USERPROFILE' : 'HOME';
  const homeDir = process.env[homeDirEnvKey];

  return `${homeDir}/.usher-cli`;
}

module.exports = installDir;