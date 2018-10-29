/* eslint-disable strict */

const includeSchema = require('./spec-data/include-schema');
const minimalSchema = require('./spec-data/minimal-schema');
const noIncludeSchema = require('./spec-data/no-include-schema');
const validate = require('./validate');

describe('v3/schema/validate', function() {
  test('a minimal schema is valid', function() {
    const valid = validate(minimalSchema);
    expect(valid).toBeTruthy();
  });

  test('a schema with no include directives is valid', function() {
    const valid = validate(noIncludeSchema);
    expect(valid).toBeTruthy();
  });

  test('a schema with include directives is valid', function() {
    const valid = validate(noIncludeSchema);
    expect(valid).toBeTruthy();
  })
});
