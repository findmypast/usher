var expect = require('chai').expect;
var build = require('./../../../src/factories/docker/build');

describe('Docker Build Command', () => {

  var tests = [
    {
      options: {
        build_arg: [
          'HTTP_PROXY=http://10.20.30.2:1234'
        ]
      },
      expected: "docker build --build-arg HTTP_PROXY=http://10.20.30.2:1234"
    }
  ];

  tests.forEach( (test) => {
    it(`should make ==> ${test.expected}`, () => {
      var command = build(test.options);
      expect(test.expected).to.equal(command);
    });
  });
});
