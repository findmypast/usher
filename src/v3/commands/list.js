/* eslint-disable strict */

const initUsherfile = require('../lib/init-usherfile');

function reduceTaskToListEntry(usherfile) {
  return function(listEntries, task) {
    return Object.assign({}, listEntries, {
      [task]: usherfile.tasks[task].description || ''
    });
  }
}

async function list(taskName, opts) {
  const usherfile = await initUsherfile(opts);

  return Object.keys(usherfile.tasks)
    .reduce(reduceTaskToListEntry(usherfile), {});
}

module.exports = list;
