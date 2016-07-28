'use strict';

const sinon = require('sinon').sandbox.create();

module.exports = {
  sandbox: sinon,
  logger: {
    task: {
      begin: sinon.stub(),
      end: sinon.stub(),
      fail: sinon.stub()
    },
    info: sinon.stub(),
    error: sinon.stub()
  }
};
