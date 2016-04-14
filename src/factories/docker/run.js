// https://docs.docker.com/engine/reference/commandline/run/

"use strict";

const _ = require('lodash');
const buildCommand = require('../buildCommand');
const buildImageName = require('../buildImageName');

const executable = "docker run";

const optionMap = {
  environment:  values  => _.map(values, item => `-e ${item}`)
                            .join(" "),
  name:       value     => `--name ${value}`,
  memory:     value     => `-m ${value}`,
  publish:    values    => _.map(values, item => `-p ${item.host}:${item.client}`)
                            .join(" "),
  remove:     value     => value ? "--rm" : ""
};

function getTarget(config) {
  return buildImageName(config);
}

module.exports = (config) => {
  const options = _.omit(config, 'target', 'container_command');
  const target = getTarget(config.target);
  return buildCommand(executable, options, optionMap, target, config.container_command);
};
