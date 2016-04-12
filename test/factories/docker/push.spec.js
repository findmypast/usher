var expect = require('chai').expect;
var build = require('./../../../src/factories/docker/push');

describe('Docker Push Command', () => {

  var tests = [
    {
      options: { image: "findmypast/usher" },
      expected: "docker push findmypast/usher"
    },
    {
      options: { tag: "master", image: "findmypast/usher" },
      expected: "docker push findmypast/usher:master"
    },
    {
      options: { image: "findmypast/usher", registry: "docker-registry.example.com" },
      expected: "docker push docker-registry.example.com/findmypast/usher"
    },
    {
      options: { tag: "master", registry: "docker-registry.example.com", image: "findmypast/usher" },
      expected: "docker push docker-registry.example.com/findmypast/usher:master"
    },
    {
      options: { tag: "master", registry: "docker-registry.example.com", image: "findmypast/usher", disable_content_trust: true },
      expected: "docker push --disable-content-trust=true docker-registry.example.com/findmypast/usher:master"
    },
    {
      options: { tag: "master", registry: "docker-registry.example.com", image: "findmypast/usher", disable_content_trust: false },
      expected: "docker push --disable-content-trust=false docker-registry.example.com/findmypast/usher:master"
    }
  ];

  tests.forEach( (test) => {
    it(`should make ==> ${test.expected}`, () => {
      var command = build(test.options);
      expect(command).to.equal(test.expected);
    });
  });
});
