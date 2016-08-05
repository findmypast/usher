'use strict';

global.Promise = require('bluebird');
global.sandbox = require('sinon').sandbox.create();
const sinonAsPromised = require('sinon-as-promised')(global.Promise);
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
global.expect = chai.expect;
global.mockery = require('mockery');
global.errors = require('../../src/v2/lib/errors');
global.mocks = require('./mocks');
global._ = require('lodash');
