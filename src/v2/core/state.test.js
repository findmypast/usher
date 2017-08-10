'use strict';

const Logger = require('../../../test/v2/mock-logger');
const State = require('./state');
const _ = require('lodash');

describe('core/state', () => {
  let sut;

  describe('given valid initial state', () => {
    const testString = 'test';
    const testObject = {
      test: 'correct!',
      other: 'thing'
    };
    const nest = [
      {
        embryo1: 'mark'
      },
      {
        embryo2: {
          eyeball: 'blue'
        }
      }
    ];
    const initialState = {
      string: testString,
      object: testObject,
      object_ref: '<%=object%>',
      complex_ref: '<%=string%> and <%=object_ref%>',
      complex_object: {
        user: '<%=user%>',
        password: '<%=password%>',
        email: '<%=email%>'
      },
      email: 'email@somewhere.com',
      password: 'password',
      user: 'username',
      nest: nest
    };

    beforeEach(() => {
      sut = new State(initialState, Logger);
    });

    describe('construction', () => {
      test('sets the initial state', () => {
        expect(sut._state).toEqual(initialState);
      });
      test('initializes the stack with the initial state', () => {
        expect(sut.stack).toEqual([initialState]);
      });
    });

    describe('accessing state', () => {
      test('gets a value', () => {
        expect(sut.get('string')).toEqual(testString);
      });
      test('gets a value from a path', () => {
        expect(sut.get('object.test')).toEqual(testObject.test);
      });
      test('returns a default value if the target isn\'t found', () => {
        const defaultValue = 'default';
        expect(sut.get('object.not_found', defaultValue)).toEqual(defaultValue);
      });
      test('returns undefined if no default and target is not found', () => {
        expect(sut.get('object.not_found')).toBeUndefined();
      });
      test('looks up a reference', () => {
        expect(sut.get('object_ref')).toEqual(testObject);
      });
      test('interpolates references onto a string', () => {
        expect(sut.get('complex_ref')).toEqual(`${testString} and ${testObject}`);
      });
      test('interpolates references within a complex object', () => {
        const expectedComplexObject = {
          user: 'username',
          password: 'password',
          email: 'email@somewhere.com'
        };
        expect(sut.get('complex_object')).toEqual(expectedComplexObject);
      });
    });

    describe('mutating state', () => {
      describe('using set()', () => {
        const expected = 'expected';

        test('sets a value', () => {
          sut.set('string', expected);
          expect(sut.get('string')).toEqual(expected);
          expect(_.last(sut.stack).string).toEqual(expected);
        });
        test('sets a nested value', () => {
          sut.set('object.new', expected);
          expect(sut.get('object.new')).toEqual(expected);
          expect(_.last(sut.stack).object.new).toEqual(expected);
        });
      });

      describe('using push()', () => {
        test('merges state', () => {
          const newTestString = 'different';
          sut.push({ string: newTestString});
          expect(sut.get('string')).toEqual(newTestString);
          expect(sut.get('object')).toEqual(testObject);
        });
        test('merges state deeply', () => {
          const newTestString = 'different';
          sut.push({ object: {test: newTestString}});
          expect(sut.get('object.test')).toEqual(newTestString);
          expect(sut.get('object.other')).toEqual(testObject.other);
        });
        test('adds the new state on the stack', () => {
          const newState = {string: 'different'};
          sut.push(newState);
          expect(sut.stack).toEqual([initialState, newState]);
        });
      });

      describe('using pop()', () => {
        const state1 = {string: 'different'};
        const state2 = {string: 'different again'};

        beforeEach(() => {
          sut.push(state1);
          sut.push(state2);
        });

        test('returns the last state on the stack', () => {
          expect(sut.pop()).toEqual(state2);
        });
        test('removes the last state from the stack', () => {
          sut.pop();
          expect(sut.stack).toEqual([initialState, state1]);
        });
        test('unmerges the last state on the stack from _state', () => {
          sut.pop();
          expect(sut.get('string')).toEqual(state1.string);
        });
      });
    });
  });

});
