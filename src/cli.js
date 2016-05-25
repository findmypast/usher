#!/usr/bin/env node
'use strict';

const program = require('commander');
const version = require('./../package.json').version;
const run = require('./run');

program
  .version(version);

program
  .command('run <preset> [args...]')
  .description('Run an Usher preset')
  .option('-f, --file [filepath]', 'Filepath for .usher.yml')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-q, --quiet', 'Disable stdout logging (will still log errors)')
  .action(run);

if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
