/* global describe before after beforeEach it expect sandbox mockery errors mocks _*/
'use strict';

beforeEach(function() {
  sandbox.reset();
});
before(function() {
  mockery.enable();
});
after(function() {
  mockery.disable();
});

describe('core/state', function() {
  let Sut;
  let sut;
  const testString = 'test';
  const testObject = {
    test: 'correct!',
    other: 'thing'
  };
  const initialState = {
    string: testString,
    object: testObject,
    object_ref: '<%=object%>',
    complex_ref: '<%=string%> and <%=object_ref%>'
  };
  const logger = mocks.loggerMock;
  before(function() {
    mockery.registerAllowable('lodash');
    mockery.registerAllowable('../lib/errors');
    mockery.registerAllowable('./state');

    Sut = require('./state');
  });
  beforeEach(function() {
    sut = new Sut(initialState, logger);
  });
  describe('state.get()', function() {
    it('gets a value', function() {
      expect(sut.get('string')).to.equal(testString);
    });
    it('gets a value from a path', function() {
      expect(sut.get('object.test')).to.equal(testObject.test);
    });
    it('looks up a reference', function() {
      expect(sut.get('object_ref')).to.equal(testObject);
    });
    it('interpolates references onto a string', function() {
      expect(sut.get('complex_ref')).to.equal(`${testString} and ${testObject}`);
    });
  });
  describe('state.push()', function() {
    it('merges state', function() {
      const newTestString = 'different';
      sut.push({ string: newTestString});
      expect(sut.get('string')).to.equal(newTestString);
      expect(sut.get('object')).to.equal(testObject);
    });
    it('merges state deeply', function() {
      const newTestString = 'different';
      sut.push({ object: {test: newTestString}});
      expect(sut.get('object.test')).to.equal(newTestString);
      expect(sut.get('object.other')).to.equal(testObject.other);
    });
  });
});
