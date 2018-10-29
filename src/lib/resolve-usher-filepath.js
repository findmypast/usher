/* eslint-disable strict */

const fs = require('fs');
const path = require('path');
const util = require('util');
const config = require('./config');

const access = util.promisify(fs.access);

function nonErrorFileAccess(result) { return result === undefined; }

function convertErrorToFalse(error) { return false; }

function accessFilepath(filepath) { return access(filepath).catch(convertErrorToFalse); }

function resolveFilepath(filename) { return path.resolve(filename); }

async function resolveUsherFilepath(filename) {
  const filepaths = [filename].concat(config.defaultFilenames).map(resolveFilepath);
  const accessAttempts = filepaths.map(accessFilepath);
  const accessResults = await Promise.all(accessAttempts);
  const index = accessResults.findIndex(nonErrorFileAccess);

  return index === -1 ? null : filepaths[index];
}

module.exports = resolveUsherFilepath;
