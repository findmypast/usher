"use strict";

const logger    = require('winston');
logger.level    = 0;
const chai      = require('chai');
const expect    = chai.expect;
const fs        = require('fs-extra');
const rewire    = require('rewire');
const init = rewire('../../src/commands/init');

const inquirerMock = {
  prompt: () => {
    const answers = {
      fastTestCommand: 'npm test',
      buildDockerCommand: 'docker build',
      buildForceRm: 'true',
      buildDockerRegistry: 'docker-registry.dun.fh',
      buildDockerImage: 'findmypast/usher',
    };

    return Promise.resolve(answers);
  }
};

init.__set__("inquirer", inquirerMock);

const expected =
`fast_tests:
  cmd: npm test

build:
  cmd: docker build
  force_rm: true
  tags:
    - registry: &REGISTRY docker-registry.dun.fh
      image: &IMAGE_NAME findmypast/usher
      tag: <%=version%>`;

describe('Given a YAML template file and JSON prompt file', () => {
  const templateName = 'usher';
  const templatesFilePath = './test/integration/templates';
  const usherFileName = `${templatesFilePath}/.usher.yml`;

  it ('should expand the tokens in the in the template file from the prompt results', () => {

    return init(templateName, {
        path: templatesFilePath,
        outputPath: templatesFilePath
      })
      .then(() => {
        const actual = fs.readFileSync(usherFileName, 'utf8');

        expect(actual.trim()).to.equal(expected.trim());
      })
      .then(() => fs.unlinkSync(usherFileName));
  });
});
