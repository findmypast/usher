'use strict';

const _ = require('lodash');

describe('list-view', () => {
  jest.mock('chalk');
  const chalk = require('chalk');
  const mockBold = (string) => {
    return '<bold>' + string + '<bold>';
  };
  chalk.bold = jest.fn();
  chalk.bold.mockImplementation(mockBold);
  const sut = require('./list-view');
  const logger = {
    info: jest.fn()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('given valid input', () => {
    const validInput = {
      build: ['builds stuff'],
      test: ['tests stuff']
    };

    beforeEach(() => {
      sut(logger.info, validInput);
    });

    test('lists all tasks with their description', () => {
      var count = 0;
      _.forOwn(validInput, (descriptions, key) => {
        expect(logger.info).toHaveBeenCalledWith(`${mockBold(key)}- ${descriptions[0]}`);
      });
    });
  });

  describe('given input that has one key with many descriptions', () => {
    const oneKeyManyDescInput = {
      build_and_test: ['builds stuff', 'tests stuff']
    };

    beforeEach(() => {
      sut(logger.info, oneKeyManyDescInput);
    });

    test('lists all descriptions', () => {
      _.forOwn(oneKeyManyDescInput, (descriptions, key) => {
        expect(logger.info).toHaveBeenCalledWith(`${mockBold(key)}- ${descriptions[0]}`);
        descriptions.shift();
        _.forEach(descriptions, (description) => {
          expect(logger.info).toHaveBeenCalledWith(`- ${description}`);
        });
      });
    });
  });
});
