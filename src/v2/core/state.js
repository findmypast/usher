'use strict';

const _ = require('lodash');

module.exports = class State {
  constructor(initialState, logger) {
    this._state = _.cloneDeep(initialState);
    this.stack = [_.cloneDeep(initialState)];
    this.logger = logger;
  }
  get(path, defaultValue) {
    return this.dereference(_.get(this._state, path, defaultValue));
  }
  set(path, value) {
    _.set(this._state, path, _.cloneDeep(value));
  }
  push(state) {
    this.stack.push(_.cloneDeep(state));
    this._state = _.merge(this._state, state);
  }
  pop() {
    const lastState = this.stack.pop();
    this._state = _.merge({}, ...this.stack);
    return lastState;
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