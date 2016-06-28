/* global describe it */
/* eslint no-underscore-dangle: "off", no-unused-expressions: "off" */
'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');
const _ = require('lodash');

const expect = chai.expect;
chai.use(sinonChai);

const logger = {
  info: sinon.spy()
};

const list = rewire('../src/list');
list.__set__({
  logger: logger
});

describe('Given a YAML file list command execution', () => {
  let filename = 'test/test.usher.yml';
  let tests = [{
    key: 'build',
    expected: 'builds the docker container'
  }];

  _.forEach(tests, (test) =>{
    list(test.key, { filepath: filename });
    it('Should print each tasks description', () => {
      expect(logger.info).to.have.been.calledWith(test.expected);
    });
  });
});
