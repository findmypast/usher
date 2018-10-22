const Ajv = require('ajv');
const schema = require('./schema');

const ajv = new Ajv();

module.exports = ajv.compile(schema);
