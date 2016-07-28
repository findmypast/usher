'use strict';

const _ = require('lodash');

module.exports = class State {
  constructor(initialState, logger) {
    this._state = initialState;
    this.stack = [initialState];
    this.logger = logger;
  }
  get(path, defaultValue) {
    return this.dereference(_.get(this._state, path, defaultValue));
  }
  set(path) {
    throw 'Not Implemented';
  }
  push(state) {
    this.stack.push(state);
    this._state = _.merge(this._state, state);
  }
  pop() {
    throw 'Not Implemented';
  }
  dereference(object) {
    if (!_.isString(object)) {
      return object;
    }
    const refPattern = /<%=(.*?)%>/;
    const refs = object.match(refPattern);
    if (!refs) {
      return object;
    }
    if (`<%=${refs[1]}%>` === object) {
      return this.get(refs[1]);
    }
    return this.dereference(_.template(object)(this._state));
  }
};
