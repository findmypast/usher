'use strict';

const _ = require('lodash');
const list = require('./list');
const filename = 'test/v1/test.usher.yml';

const descriptions = {
  build: 'builds the docker container',
  publish: '',
  build_seq: 'kills the running container then builds the docker container'
};

describe('Given a YAML file, and a task with a description', () => {
  test('Should list the tasks first description', () => {
    let key = 'build';
    let expected = descriptions.build;

    const listedTasks = list(key, {
      file: filename
    });

    expect(listedTasks[key]).toBeDefined();
    expect(listedTasks[key]).toContain(expected);
  });

  test('Should list the tasks sub-description', () => {
    let key = 'build_seq';
    let taskDescriptions = {
      [key]: [
        'kills the running container then builds the docker container',
        'remove container',
        'build container']
    };

    const listedTasks = list('build_seq', {
      file: filename
    });

    expect(listedTasks).toEqual(taskDescriptions);
  });
});

describe('Given a YAML file, and listing all commands', () => {
  test('Should print the first description of each task', () => {
    const taskDescriptionList = list(null, {
      file: filename
    });
    _.forOwn(descriptions, (value, key) => {
      expect(taskDescriptionList[key]).toBeDefined();
      expect(taskDescriptionList[key]).toContain(value);
    });
  });
});
