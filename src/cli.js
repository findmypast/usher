#!/usr/bin/env node

const program = require('commander');
const version = require('./../package.json').version
const commands = require('./commands');
const logger = require('winston');
logger.cli()

program
  .version(version)

program
  .command('init <templateName>')
  .option('-p, --path [templatepath]', 'Path to the template files')
  .option('-o, --outputPath [outputpath]', 'Path for the output file')
  .description('Initialise your project for use with Usher')
  .action(commands.init);

program
  .command('run <preset> [args...]')
  .description('Run an Usher preset')
  .option('-f, --file [filepath]', 'Filepath for .usher.yml')
  .action(commands.run);

program.parse(process.argv);
