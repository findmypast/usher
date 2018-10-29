#!/usr/bin/env node

'use strict';

const program = require('commander');
const handle = require('./lib/error-handler');
const list = handle(require('./list'));
const run = handle(require('./run'));

const version = require('./../package.json').version;

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

program
  .command('*')
  .action(() => program.outputHelp());

program.parse(process.argv);
