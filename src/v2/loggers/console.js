'use strict';

module.exports = {
  task: {
    begin: state => console.log(`Begin task ${state.get('name')}`),
    end: state => console.log(`End task ${state.get('name')}`),
    fail: state => console.error(`Failed task ${state.get('name')}`)
  },
  info: console.log,
  error: console.error
};
