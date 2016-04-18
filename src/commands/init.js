'use strict';

const fs = require('fs-extra');
const _ = require('lodash');
let inquirer = require('inquirer');
const path = require('path');
const handlebars = require('handlebars');

module.exports = (templateName, opts) => {
  const templatePath = path.resolve(opts.path || `${__dirname}/templates`);
  const usherFilePath = path.resolve(opts.outputPath || `${__dirname}`);
  const templateFilename = `${templatePath}/template.${templateName}.yml`;
  const jsonPromptFilename = `${templatePath}/prompt.${templateName}.json`;
  const prompts = fs.readJsonSync(jsonPromptFilename);

  return inquirer.prompt(prompts)
    .then(answers => {
      const source = fs.readFileSync(templateFilename, 'utf-8');
      const template = handlebars.compile(source);
      const result = template(answers);

      return fs.writeFileSync(`${usherFilePath}/.usher.yml`, result);
    });
}
