/* global describe it expect*/
/* eslint no-underscore-dangle: "off", no-unused-expressions: "off" */
'use strict';

const _ = require('lodash');
const list = require('../../src/v1/list');
const filename = 'test/v1/test.usher.yml';

const descriptions = {
  build: 'builds the docker container',
  publish: '',
  build_seq: 'kills the running container then builds the docker container'
};

describe('Given a YAML file, and a task with a description', () => {
  it('Should list the tasks first description', () => {
    let key = 'build';
    let expected = descriptions.build;

    const listedTasks = list(key, {
      file: filename
    });

    expect(listedTasks).to.include.keys(key);
    expect(listedTasks[key]).to.include(expected);
  });

  it('Should list the tasks sub-description', () => {
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

    expect(listedTasks).to.deep.equal(taskDescriptions);
  });
});

describe('Given a YAML file, and listing all commands', () => {
  it('Should print the first description of each task', () => {
    const taskDescriptionList = list(null, {
      file: filename
    });
    _.forOwn(descriptions, (value, key) => {
      expect(taskDescriptionList).to.include.keys(key);
      expect(taskDescriptionList[key]).to.include(value);
    });
  });
});
