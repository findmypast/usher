const run = require('./run');
const path = require('path');

describe('v3/commands/run', () => {
  describe('given invalid input', () => {
    const file = path.join(__dirname, 'spec-data', 'run.yml');
    
    test('throws an error when specified task can not be found in usher file', async function() {
      var opts = { file };
      const expected = /the task fake_task_name could not be found/
      const actual = run('fake_task_name', null, opts);

      await expect(actual).rejects.toThrowError(expected);
    });
    
    test('throws an error when required parameter is not provided', async function() {
      var opts = { file };
      const expected = /the required parameter\(s\) vault_password were not supplied to task obtain_grafana_api_key/
      const actual = run('obtain_grafana_api_key', ['vault_username=foo'], opts);
      
      await expect(actual).rejects.toThrowError(expected);
    });
  });
});
