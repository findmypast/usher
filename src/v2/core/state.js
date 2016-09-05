'use strict';

const _ = require('lodash');

module.exports = class State {
  constructor(initialState, Logger) {
    this._state = _.cloneDeep(initialState);
    this.stack = [_.cloneDeep(initialState)];
    this.logger = new Logger(this);
  }
  get(path, defaultValue) {
    return this.dereference(_.get(this._state, path, defaultValue));
  }
  set(path, value) {
    _.set(this._state, path, _.cloneDeep(value));
    _.set(_.last(this.stack), path, _.cloneDeep(value));
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

  peek() {
    const lastState = this.stack.pop();
    this.stack.push(lastState);

    return lastState;
  }

  dereference(object) {
    if (_.isArray(object)) {
      const result = this.dereferenceArray(object);
      console.log(result);

      return result;
    }

    if (!_.isString(object)) {
      return this.dereferenceObject(object);
    }

    const refPattern = /<%=(.*?)%>/;
    const refs = object.match(refPattern);

    if (!refs) {
      console.log(`DEREF DONE: ${object}`);
      return object;
    }
    var x = `<%=${refs[1]}%>`;
    console.log(`DEBUG: <%=${refs[1]}%> (${x === object})`);
    if (`<%=${refs[1]}%>` === object) {
      console.log(`DEBUG: ${this._state[refs[1]]} (${typeof this._state[refs[1]]})`);
      console.log(!_.isString(this._state[refs[1]]));
      return this.get(refs[1]);
    }

    console.log(`DEREF: ${object} (${this._state.service_tag})`);

    return this.dereference(_.template(object)(this._state));
  }

  dereferenceObject(object) {
    _.forOwn(object, (value, key) => {
      if (_.isString(value)) {
        object[key] = this.dereference(value);
      }
    });

    return object;
  }

  dereferenceArray(arr) {
    return _.map(arr, element => {
      return this.dereference(element);
    });
  }
};
