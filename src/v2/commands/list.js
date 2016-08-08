'use strict';
const _ = require('lodash');
const parse = require('./parse');
const ParsingError = require('../lib/errors').ParsingError;

const DEFAULT_FILE = 'usher.yml';

module.exports = (taskName, opts) => {
  const file = opts.file || DEFAULT_FILE;
  let parsedFile;
  try {
    parsedFile = parse(file);
  }
  catch (error) {
    throw new ParsingError(error, file);
  }
  _.map(parsedFile.tasks, (task, name) => {
    console.log(`${name}\t\t${task.description}`);
  });
};
