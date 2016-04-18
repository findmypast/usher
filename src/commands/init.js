'use strict';

const fs = require('fs-extra');
const _ = require('lodash');
let inquirer = require('inquirer');
const path = require('path');
const handlebars = require('handlebars');

function guardFileExists(fileName, message){
  try {
      fs.statSync(fileName);
  } catch (e) {
      throw message;
  };
}

module.exports = (templateName, opts) => {
  const templatePath = path.resolve(opts.path || `${__dirname}/templates`);
  const usherFilePath = path.resolve(opts.outputPath || `${__dirname}`);
  const templateFilename = `${templatePath}/template.${templateName}.yml`;
  const jsonPromptFilename = `${templatePath}/prompt.${templateName}.json`;

  guardFileExists(jsonPromptFilename, `Template prompts file does not exist, cannot find ${jsonPromptFilename}`);
  guardFileExists(templateFilename, `Template file does not exist, cannot find  ${templateFilename}`);
  const prompts = fs.readJsonSync(jsonPromptFilename);

  return inquirer.prompt(prompts)
    .then(answers => {

      const source = fs.readFileSync(templateFilename, 'utf-8');
      const template = handlebars.compile(source);
      const result = template(answers);

      return fs.writeFileSync(`${usherFilePath}/.usher.yml`, result);
    });
}
