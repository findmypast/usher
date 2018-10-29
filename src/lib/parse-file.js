/* eslint-disable strict */

const fs = require('fs');
const util = require('util');
const yaml = require('js-yaml');
const resolveUsherFilepath = require('./resolve-usher-filepath');

const readFile = util.promisify(fs.readFile);

async function parseFile(file) {
  const filepath = await resolveUsherFilepath(file);
  
  try {
    const fileContents = await readFile(filepath, 'utf8');
    return yaml.safeLoad(fileContents);
  } catch (ex) {
    throw new ParsingError(ex, filepath);
  }
}

module.exports = parseFile;

class ParsingError extends Error {
  constructor(error, file) {
    super(`Error parsing ${file}: ${error.message}`);
  }
}