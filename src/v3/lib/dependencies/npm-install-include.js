const cp = require('child_process');
const installDir = require('./install-dir');

function npmInstallInclude(include) {
  const cwd = installDir();
  cp.execSync(`npm install ${include.from} --prefix ${cwd}`);
}

module.exports = npmInstallInclude;