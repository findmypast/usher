'use strict';

module.exports = {
  'missing version field': {
    tasks: { a: { actions: [{ do: 'foo' }] } }
  },
  'invalid version field': {
    version: '2',
    tasks: { a: { actions: [{ do: 'foo' }] } }
  },
  'missing tasks field': {
    version: '3'
  },
  'empty tasks field': {
    version: '3',
    tasks: {}
  },
  'missing actions field': {
    version: '3',
    tasks: { a: {} }
  },
  'empty actions field': {
    version: '3',
    tasks: { a: { actions: [] } }
  },
  'multiple errors': {
    version: '2',
    tasks: { a: { actions: [] } }
  }
}