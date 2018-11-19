/* eslint-disable strict */

const fs = require('fs');
const yaml = require('js-yaml');

function parseFile(filepath) {
  try {
    const fileContents = fs.readFileSync(filepath, 'utf8');
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