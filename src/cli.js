#!/usr/bin/env node

'use strict';

const program = require('commander');
const version = require('./../package.json').version;
const run = require('./run');
const list = require('./list');

program
  .version(version);

program
  .command('run <preset> [args...]')
  .description('Run an Usher preset')
  .option('-f, --file [filepath]', 'Filepath for .usher.yml')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-q, --quiet', 'Disable stdout logging (will still log errors)')
  .action(run);

program
  .command('list [preset]')
  .description('List all or specific task description')
  .option('-f, --file [filepath]', 'Filepath for .usher.yml')
  .action(list);

if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
