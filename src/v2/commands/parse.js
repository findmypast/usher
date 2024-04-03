'use strict';

const parser = require('js-yaml');
const fs = require('fs');

module.exports = file => parser.load(fs.readFileSync(file, 'utf8'));
