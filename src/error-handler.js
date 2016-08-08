'use strict';

module.exports = fn =>
  (...args) =>
    fn(...args)
    .catch((e) => {
      console.error('Error: ' + e.message.split('\n')[0]);
      process.exit(1);
    });
