// https://docs.docker.com/engine/reference/commandline/push/

"use strict";

const _ = require('lodash');
const buildCommand = require('../buildCommand');
const buildImageName = require('../buildImageName');

const executable = 'docker push'

const optionMap = {
  disable_content_trust: value => `--disable-content-trust=${value}`
};

function getTarget(config) {
  if(config.image == undefined) return '';
  return buildImageName(config);
}

module.exports = (config) => {
  let options = _.omit(config, 'registry', 'image', 'tag');
  let target = getTarget(config);
  return buildCommand(executable, options, optionMap, target);
};
