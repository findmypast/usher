const includeSchema = require('./spec-data/include-schema');
const invalidSchemata = require('./spec-data/invalid-schemata');
const minimalSchema = require('./spec-data/minimal-schema');
const noIncludeSchema = require('./spec-data/no-include-schema');
const validate = require('./validate');

const invalidSchemataTests = Object.keys(invalidSchemata);
const invalidSchemataErrors = {
  'missing version field': /usherfile should have required property 'version'/,
  'invalid version field': /usherfile\.version should match pattern "\^3\$"/,
  'missing tasks field': /usherfile should have required property 'tasks'/,
  'empty tasks field': /usherfile\.tasks should NOT have fewer than 1 properties/,
  'missing actions field': /usherfile\.tasks\['a'\] should have required property 'actions'/,
  'empty actions field': /usherfile\.tasks\['a'\]\.actions should NOT have fewer than 1 items/,
  'multiple errors': /usherfile\.version should match pattern "\^3\$"\n\tusherfile\.tasks\['a'\]\.actions should NOT have fewer than 1 items/
}

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
  });

  test('invalid schemata throw with the appropriate error message', function () {
    invalidSchemataTests.forEach(ist => {
      expect(() => validate(invalidSchemata[ist])).toThrow(invalidSchemataErrors[ist]);
    }) 
  })
});
