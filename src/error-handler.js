'use strict';


module.exports = fn =>
  (...args) =>
    fn(...args)
    .catch((e) => {
      //TODO: use logger here, not console
      console.error('Error: ' + e.message.split('\n')[0]);
      process.exit(1);
    });
