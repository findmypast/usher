const installDir = require('./install-dir');

function requireInclude(moduleName) {
  const cwd = installDir();

  return require(`${cwd}/node_modules/${moduleName}`);
}

module.exports = requireInclude;