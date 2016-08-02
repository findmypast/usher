'use strict';

module.exports = fn =>
  (...args) =>
    fn(...args)
    .catch((e) => {
      process.exit(1);
    });
