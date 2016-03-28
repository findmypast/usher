#!/usr/bin/env node

const program = require('commander');
const version = require('./../package.json').version
const commands = require('./commands')

program
  .version(version)

program
  .command('init')
  .description('Initialise your project for use with Usher')
  .action(commands.init);

program
  .command('run [commands...]')
  .description('Run one or multiple Usher commands')
  .action(commands.run);

program.parse(process.argv);
