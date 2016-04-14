"use strict";

const _ = require('lodash');

module.exports = (config) => {
  const registry = config.registry ? `${config.registry}/` : '';
  const image = config.image || '';
  const tag = config.tag ? `:${config.tag}` : '';
  return `${registry}${image}${tag}`;
}
