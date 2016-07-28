/* global describe before after beforeEach it expect sandbox mockery mocks */
/* eslint no-unused-expressions: "off" */
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
  describe('new State()', function() {
    it('sets the initial state', function() {
      expect(sut._state).to.equal(initialState);
    });
    it('initializes the stack with the initial state', function() {
      expect(sut.stack).to.deep.equal([initialState]);
    });
  });
  describe('state.get()', function() {
    it('gets a value', function() {
      expect(sut.get('string')).to.equal(testString);
    });
    it('gets a value from a path', function() {
      expect(sut.get('object.test')).to.equal(testObject.test);
    });
    it('returns a default value if the target isn\'t found', function() {
      const defaultValue = 'default';
      expect(sut.get('object.not_found', defaultValue)).to.equal(defaultValue);
    });
    it('returns undefined if no default and target is not found', function() {
      expect(sut.get('object.not_found')).to.be.undefined;
    });
    it('looks up a reference', function() {
      expect(sut.get('object_ref')).to.equal(testObject);
    });
    it('interpolates references onto a string', function() {
      expect(sut.get('complex_ref')).to.equal(`${testString} and ${testObject}`);
    });
  });
  describe('state.set()', function() {
    const expected = 'expected';
    it('sets a value', function() {
      sut.set('string', expected);
      expect(sut.get('string')).to.equal(expected);
    });
    it('sets a nested value', function() {
      sut.set('object.new', expected);
      expect(sut.get('object.new')).to.equal(expected);
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
    it('adds the new state on the stack', function() {
      const newState = {string: 'different'};
      sut.push(newState);
      expect(sut.stack).to.deep.equal([initialState, newState]);
    });
  });
  describe('state.pop()', function() {
    const state1 = {string: 'different'};
    const state2 = {string: 'different again'};
    beforeEach(function() {
      sut.push(state1);
      sut.push(state2);
    });
    it('returns the last state on the stack', function() {
      expect(sut.pop()).to.equal(state2);
    });
    it('removes the last state from the stack', function() {
      sut.pop();
      expect(sut.stack).to.deep.equal([initialState, state1]);
    });
    it('unmerges the last state on the stack from _state', function() {
      sut.pop();
      expect(sut.get('string')).to.equal(state1.string);
    });
  });
});
