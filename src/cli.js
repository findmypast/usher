#!/usr/bin/env node

const program = require('commander');
const version = require('./../package.json').version
const run = require('./run');
const logger = require('winston');
logger.cli()

program
  .version(version)

program
  .command('run <preset> [args...]')
  .description('Run an Usher preset')
  .option('-f, --file [filepath]', 'Filepath for .usher.yml')
  .action(run);

program.parse(process.argv);
