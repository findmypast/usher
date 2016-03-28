var expect = require('chai').expect;
var build = require('./../../../src/factories/docker/build')

describe('Docker Build Command', () => {

  var tests = [
    { options: {}, expected: "" }
  ];

  tests.forEach( (test) => {
    it(`should build command ${test.expected}`, () => {
      var command = build(test.options);
      expect(test.expected).to.equal(command);
    });
  })
});
