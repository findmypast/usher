/* eslint-disable strict */

const firstline = require('firstline');
const resolveUsherFilepath = require('./resolve-usher-filepath');

const versionPattern = /[0-9]+/;

async function getFirstline(filename) {
  try { return await firstline(filename); }
  catch (ex) { return ''; }
}

async function getVersion(file) {
  const filename = await resolveUsherFilepath(file);
  if (filename == null) return '0';
  
  const firstLine = await getFirstline(filename);
  const matches = versionPattern.exec(firstLine);

  return matches ? matches[0] : '0';
}

module.exports = getVersion;