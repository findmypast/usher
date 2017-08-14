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
      _.forOwn(validInput, (description, key) => {
        expect(logger.info.mock.calls[count][0]).toContain(key);
        expect(logger.info.mock.calls[count++][0]).toContain(description);
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
      var count = 0;
      _.forOwn(oneKeyManyDescInput, (descriptions, key) => {
        expect(logger.info.mock.calls[count++][0]).toContain(key);
        descriptions.shift();
        _.forEach(descriptions, (description) => {
            expect(logger.info.mock.calls[count++][0]).toContain(description);
        });
      });
    });
  });
});
