/* eslint-disable strict */

const parseFile = require('../../lib/parse-file');
const resolveUsherFilepath = require('../../lib/resolve-usher-filepath');
const validate = require('./schema/validate');

async function initUsherfile(opts) {
  const filepath = await resolveUsherFilepath(opts.file);
  const usherfile = parseFile(filepath);
  validate(usherfile);

  return usherfile;
}

module.exports = initUsherfile;
