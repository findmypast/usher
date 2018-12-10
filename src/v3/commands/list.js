const initUsherfile = require('../lib/init-usherfile');

function reduceTaskToListEntry(usherfile) {
  return function(listEntries, task) {
    const description = usherfile.tasks[task].description;

    return Object.assign({}, listEntries, {
      [task]: description == null ? [''] : [description]
    });
  }
}

async function list(taskName, opts) {
  const usherfile = await initUsherfile(opts);

  return Object.keys(usherfile.tasks)
    .reduce(reduceTaskToListEntry(usherfile), {});
}

module.exports = list;
