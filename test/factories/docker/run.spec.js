var expect = require('chai').expect;
var build = require('./../../../src/factories/docker/run');

describe('Docker Run Command', () => {

  var tests = [
    {
      options: {
        environment: [
          'node_env=prod',
          'version=1'
        ],
        target: {
          image: 'usher',
          tag: 'test',
          registry: 'myReg'
        }
      },
      expected: "-e node_env=prod -e version=1"
    },
    {
      options: {
        detach: true,
        target: {
          image: 'usher',
          tag: 'test',
          registry: 'myReg'
        }
      },
      expected: "-d"
    },
    {
      options: {
        network: 'test-network',
        target: {
          image: 'usher',
          tag: 'test',
          registry: 'myReg'
        }
      },
      expected: "--net test-network"
    },
    {
      options: {
        target: {
          image: 'usher',
          tag: 'test',
          registry: 'myReg'
        },
        memory: '256M'
      },
      expected: "-m 256M"
    },
    {
      options: {
        target: {
          image: 'usher',
          tag: 'test',
          registry: 'myReg'
        },
        name: 'usher'
      },
      expected: "--name usher"
    },
    {
      options: {
        target: {
          image: 'usher',
          tag: 'test',
          registry: 'myReg'
        },
        restart: 'always'
      },
      expected: "--restart always"
    },
    {
      options: {
        target: {
          image: 'usher',
          tag: 'test',
          registry: 'myReg'
        },
        publish: [ {
          client: 80,
          host: 80
        },
        {
          client: 1234,
          host: 4567
        }]
      },
      expected: "-p 80:80 -p 4567:1234"
    },
    {
      options: {
        target: {
          image: 'usher',
          tag: 'test',
          registry: 'myReg'
        },
        container_command: 'run this'
      },
      expected: "docker run myReg/usher:test run this"
    },
    {
      options: {
        remove: true,
        target: {
          image: 'usher',
          tag: 'test',
          registry: 'myReg'
        }
      },
      expected: "--rm"
    }
  ];

  tests.forEach( (test) => {
    it(`should make ==> ${test.expected}`, () => {
      var command = build(test.options);
      expect(command).to.contain(test.expected);
    });
  });
});
