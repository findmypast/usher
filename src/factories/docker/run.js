// https://docs.docker.com/engine/reference/commandline/run/

"use strict";

const _ = require('lodash');
const buildCommand = require('../buildCommand');
const buildImageName = require('../buildImageName');

const optionMap = {
  environment:  values  => _.map(values, item => `-e ${item}`)
                            .join(" "),
  name:       value     => `--name ${value}`,
  network:    value     => `--net ${value}`,
  restart:    value     => `--restart ${value}`,
  memory:     value     => `-m ${value}`,
  publish:    values    => _.map(values, item => `-p ${item.host}:${item.client}`)
                            .join(" "),
  remove:     value     => value ? "--rm" : "",
  detach:     value     => value ? "-d" : ""
};

function getTarget(config) {
  return buildImageName(config);
}

module.exports = (config) => {
  const options = _.omit(config, 'target', 'container_command', 'host');
  const target = getTarget(config.target);
  const executable = config.host ? `docker -H ${config.host} run` : 'docker run';
  return buildCommand(executable, options, optionMap, target, config.container_command);
};
