/* eslint-disable strict */

const fs = require('fs');
const path = require('path');
const util = require('util');
const config = require('./config');

const access = util.promisify(fs.access);

function nonErrorFileAccess(result) { return result === undefined; }

function convertErrorToFalse(error) { return false; }

function accessFilepath(filepath) { return access(filepath).catch(convertErrorToFalse); }

function resolveFilepath(filename) { return filename ? path.resolve(filename) : null; }

async function resolveUsherFilepath(filename) {
  const filepaths = [filename].concat(config.defaultFilenames).map(resolveFilepath);
  const accessAttempts = filepaths.map(accessFilepath);
  const accessResults = await Promise.all(accessAttempts);
  const index = accessResults.findIndex(nonErrorFileAccess);

  if (index === -1) {
    throw new FileNotFoundError(filepaths);
  }

  return filepaths[index];
}

module.exports = resolveUsherFilepath;

class FileNotFoundError extends Error {
  constructor(filepaths) {
    const msg = 'an usher file could not be found at any of the following paths:\n';
    const nonEmptyFilepaths = filepaths.filter(fp => fp && fp.length > 0);
    super(`${msg}${nonEmptyFilepaths.join('\n')}`);
  }
}
