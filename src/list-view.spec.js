/* global describe before after beforeEach it expect sandbox  _*/
'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const _ = require('lodash');
const chalk = require('chalk');
const expect = chai.expect;
chai.use(sinonChai);

const logger = {
  info: sinon.spy()
};

describe('list-view', function() {
  let sut;
  let input;
  const validInput = {
    build: ['builds stuff'],
    test: ['tests stuff']
  };

  const oneKeyManyDescInput = {
    build_and_test: ['builds stuff', 'tests stuff']
  };

  before(function() {
    sut = require('./list-view');
  });
  beforeEach(function() {
    sandbox.reset();
  });
  describe('given valid input', function() {
    before(function() {
      input = _.cloneDeep(validInput);
    });
    beforeEach(function() {
      sut(logger.info, input);
    });
    it('lists all tasks with their description', function() {
      _.forOwn(validInput, (descriptions, key) => {
        expect(logger.info).to.have.been.calledWith(`${chalk.bold(key)}- ${descriptions[0]}`);
      });
    });
  });

  describe('given input that has one key with many descriptions', function() {
    before(function() {
      input = _.cloneDeep(oneKeyManyDescInput);
    });
    beforeEach(function() {
      sut(logger.info, input);
    });
    it('lists all descriptions', function() {
      _.forOwn(oneKeyManyDescInput, (descriptions, key) => {
        expect(logger.info).to.have.been.calledWith(`${chalk.bold(key)}- ${descriptions[0]}`);
        descriptions.shift();
        _.forEach(descriptions, (description) => {
          expect(logger.info).to.have.been.calledWith(`- ${description}`);
        });
      });
    });
  });
});
