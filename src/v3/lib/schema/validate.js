const Ajv = require('ajv');
const InvalidConfigError = require('../../errors/invalid-config');
const schema = require('./schema');

const ajv = new Ajv({ allErrors: true });
const _validate = ajv.compile(schema);

function validate(usherfile) {
  const isValid = _validate(usherfile);

  if (isValid) return true;

  const messageOpts = { separator: '\n\t', dataVar: 'usherfile' };
  const message = ajv.errorsText(_validate.errors, messageOpts);
  
  throw new InvalidConfigError(`\t${message}`);
}

module.exports = validate;
