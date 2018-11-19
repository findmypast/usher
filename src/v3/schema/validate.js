const Ajv = require('ajv');
const InvalidConfigError = require('../errors/invalid-config');
const schema = require('./schema');

const ajv = new Ajv();
const _validate = ajv.compile(schema);

function validate(usherfile) {
  const isValid = _validate(usherfile);

  if (isValid) return true;

  const message = validate.errors.map(schemaErrorToMessage).join('\n');
  
  throw new InvalidConfigError(message);
}

module.exports = validate;

function schemaErrorToMessage({ keyword, message, schemaPath }) {
  return `${keyword} at ${schemaPath}: ${message}`;
}
