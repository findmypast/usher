'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
global.expect = chai.expect;
global.mockery = require('mockery');
global.Promise = require('bluebird');
global.errors = require('../../src/v2/lib/errors');
global.mocks = require('./mocks');
global._ = require('lodash');
global.sandbox = global.mocks.sandbox;
