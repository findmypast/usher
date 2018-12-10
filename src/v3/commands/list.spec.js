const list = require('./list');
const path = require('path');

describe('v3/commands/list', () => {
  describe('given valid input', () => {
    const file = path.join(__dirname, 'spec-data', 'list.yml');
    const expected = {
      obtain_grafana_api_key: 'Obtains the Grafana API key from Vault',
      publish_dashboard_to_grafana: ''
    };

    test('lists all tasks in usher file', async function() {
      var opts = { file };
      await expect(list(null, opts)).resolves.toEqual(expected);
    });
  });
});
