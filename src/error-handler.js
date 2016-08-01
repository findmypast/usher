'use strict';


module.exports = fn =>
  (...args) =>
    fn(...args)
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
