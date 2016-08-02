'use strict';

module.exports = fn =>
  (...args) =>
    fn(...args)
    .catch((e) => {
      console.error(e)
      process.exit(1);
    });
