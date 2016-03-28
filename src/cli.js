#!/usr/bin/env node

const program = require('commander');

program
  .version('0.0.1')
  .option('init', "Create a `.usher.yml file with some defaults`")
  .action(function () {
    let init = require("./commands/init");
    init();
  })
  .option('run [commands...]', "Run commands contained in `.usher.yml`")
  .action(function (commands) {
    let run = require("./commands/run");
    run(commands);
  });

program.parse(process.argv);
