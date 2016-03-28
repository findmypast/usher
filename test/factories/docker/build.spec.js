var expect = require('chai').expect;
var build = require('./../../../src/factories/docker/build');

describe('Docker Build Command', () => {

  var tests = [
    {
      options: {
        build_arg: [
          'HTTP_PROXY=http://10.20.30.2:1234',
          'HTTPS_PROXY=https://10.20.30.2:1234'
        ]
      },
      expected: "docker build --build-arg HTTP_PROXY=http://10.20.30.2:1234 --build-arg HTTPS_PROXY=https://10.20.30.2:1234"
    },
    {
      options: {
        cpu_shares: true
      },
      expected: "docker build --cpu-shares"
    },
    {
      options: {
        file: "Dockerfile.test"
      },
      expected: "docker build -f Dockerfile.test"
    },
    {
      options: {
        cpu_shares: true,
        file: "Dockerfile.test"
      },
      expected: "docker build --cpu-shares -f Dockerfile.test"
    },
  ];

  tests.forEach( (test) => {
    it(`should make ==> ${test.expected}`, () => {
      var command = build(test.options);
      expect(test.expected).to.equal(command);
    });
  });
});
