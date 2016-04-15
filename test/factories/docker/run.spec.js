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
      expected: "docker run -e node_env=prod -e version=1 myReg/usher:test"
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
      expected: "docker run -d myReg/usher:test"
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
      expected: "docker run --net test-network myReg/usher:test"
    },
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
        },
        memory: '256M'
      },
      expected: "docker run -e node_env=prod -e version=1 -m 256M myReg/usher:test"
    },
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
        },
        name: 'usher'
      },
      expected: "docker run -e node_env=prod -e version=1 --name usher myReg/usher:test"
    },
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
        },
        restart: 'always'
      },
      expected: "docker run -e node_env=prod -e version=1 --restart always myReg/usher:test"
    },
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
      expected: "docker run -e node_env=prod -e version=1 -p 80:80 -p 4567:1234 myReg/usher:test"
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
        },
        container_command: 'run this'
      },
      expected: "docker run --rm myReg/usher:test run this"
    }
  ];

  tests.forEach( (test) => {
    it(`should make ==> ${test.expected}`, () => {
      var command = build(test.options);
      expect(command).to.equal(test.expected);
    });
  });
});
