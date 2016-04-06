#!/usr/bin/env node

const program = require('commander');
const version = require('./../package.json').version
const commands = require('./commands');
const logger     = require('winston');

program
  .version(version)

program
  .command('init')
  .description('Initialise your project for use with Usher')
  .action(commands.init);

program
  .command('run <preset>')
  .description('Run an Usher preset')
  .action(commands.run);

program.parse(process.argv);
