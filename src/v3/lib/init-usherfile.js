/* eslint-disable strict */

const parseFile = require('../../lib/parse-file');
const validate = require('../schema/validate');

function schemaErrorToMessage({ keyword, message, schemaPath }) {
  return `${keyword} at ${schemaPath}: ${message}`;
}

async function initUsherfile(opts) {
  const usherfile = await parseFile(opts.file);
  const isValid = validate(usherfile);

  if (isValid) return usherfile;

  const message = validate.errors.map(schemaErrorToMessage).join('\n');
  
  throw new InvalidConfigError(message);
}

module.exports = initUsherfile;

class InvalidConfigError extends Error {
  constructor(message) {
    super(`Error in configuration:\n${message}.\nPlease check your config file.`);
  }
}
