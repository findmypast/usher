var expect = require('chai').expect;
var build = require('./../../../src/factories/docker/pull');

describe('Docker Pull Command', () => {

  var tests = [
    {
      options: { tag: "master" },
      expected: "docker pull"
    },
    {
      options: { image: "findmypast/usher" },
      expected: "docker pull findmypast/usher"
    },
    {
      options: { tag: "master", image: "findmypast/usher" },
      expected: "docker pull findmypast/usher:master"
    },
    {
      options: { registry: "docker-registry.example.com" },
      expected: "docker pull"
    },
    {
      options: { registry: "docker-registry.example.com", tag: "master" },
      expected: "docker pull"
    },
    {
      options: { image: "findmypast/usher", registry: "docker-registry.example.com" },
      expected: "docker pull docker-registry.example.com/findmypast/usher"
    },
    {
      options: { tag: "master", registry: "docker-registry.example.com", image: "findmypast/usher" },
      expected: "docker pull docker-registry.example.com/findmypast/usher:master"
    },
    {
      options: { tag: "master", registry: "docker-registry.example.com", image: "findmypast/usher", all_tags: true },
      expected: "docker pull --all-tags docker-registry.example.com/findmypast/usher:master"
    },
    {
      options: { tag: "master", registry: "docker-registry.example.com", image: "findmypast/usher", disable_content_trust: true },
      expected: "docker pull --disable-content-trust=true docker-registry.example.com/findmypast/usher:master"
    },
    {
      options: { tag: "master", registry: "docker-registry.example.com", image: "findmypast/usher", all_tags: false },
      expected: "docker pull docker-registry.example.com/findmypast/usher:master"
    },
    {
      options: { tag: "master", registry: "docker-registry.example.com", image: "findmypast/usher", disable_content_trust: false },
      expected: "docker pull --disable-content-trust=false docker-registry.example.com/findmypast/usher:master"
    }
  ];

  tests.forEach( (test) => {
    it(`should make ==> ${test.expected}`, () => {
      var command = build(test.options);
      expect(test.expected).to.equal(command);
    });
  });
});
