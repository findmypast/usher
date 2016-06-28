/* global describe it */
/* eslint no-underscore-dangle: "off", no-unused-expressions: "off" */
'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');
const _ = require('lodash');
const chalk = require('chalk');

const filename = 'test/test.usher.yml';

const expect = chai.expect;
chai.use(sinonChai);

const logger = {
  info: sinon.spy()
};

const list = rewire('../src/list');
list.__set__({
  logger: logger
});

const descriptions = {
  build: 'builds the docker container',
  publish: '',
  build_seq: 'kills the running container then builds the docker container'
};

describe('Given a YAML file, and a task with a description', () => {

  it('Should print the tasks first description', () => {
    let key = 'build';
    let expected = descriptions.build;

    list(key, {
      filepath: filename
    });

    expect(logger.info).to.have.been.calledWith(expected);
  });

  it('Should print the tasks sub-description', () => {
    let key = 'build_seq';
    let expectedList = [
      'kills the running container then builds the docker container',
      'remove container',
      'build container'
    ];

    list(key, {
      filepath: filename
    });

    _.forEach(expectedList, (expected) => {
      expect(logger.info).to.have.been.calledWith(expected);
    });
  });
});

describe('Given a YAML file, and a task without a description', () => {
  let key = 'publish';
  let expected = '';

  list(key, {
    filepath: filename
  });
  it('Should print an empty string', () => {
    expect(logger.info).to.have.been.calledWith(expected);
  });
});

describe('Given a YAML file, and listing all commands', () => {
  list(undefined, {
    filepath: filename
  });

  it('Should print the first description of each task', () => {
    _.forOwn(descriptions, (value, key) => {
      expect(logger.info).to.have.been.calledWith(`${chalk.underline(key)} - ${value}`);
    });
  });
});
