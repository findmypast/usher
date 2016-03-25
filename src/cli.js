#!/usr/bin/env node

const program = require('commander');

program
  .version('0.0.1')
  .option('--hey', 'HEY!')
  .option('--ho', 'HO!')
  .parse(process.argv);

if (program.hey) console.log('HEY!');
if (program.ho) console.log('HO!');
if (program.hey && program.ho) console.log('LET\'s GO!!');
