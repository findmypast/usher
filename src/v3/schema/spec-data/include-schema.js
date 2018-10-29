module.exports = {
  version: '3',
  description: 'A series of tasks for publishing dashboards to Grafana using Dashee (an internal Findmypast tool)',
  includes: {
    domesday: {
      from: 'domesday.yml'
    }
  },
  params: {
    dashboard_file: 'The file path of a Grafana JSON format dashboard',
    vault_url: 'The url of the running vault instance',
    vault_username: 'The username used to authenticate with vault',
    vault_password: 'The password used to authenticate with vault'
  },
  tasks: {
    obtain_grafana_api_key: {
      description: 'Obtains the Grafana API key from Vault',
      params: ['vault_username', 'vault_password'],
      outputs: ['grafana_api_key'],
      actions: [{
        do: 'domesday.obtain_secret_with_user_pass register_state_key=grafana_api_key vault_username=<%=vault_username%> vault_password=<%=vault_password%> vault_secret=path/to/grafana/api/key',
        options: { register: 'grafana_api_key' }
      }]
    },
    publish_dashboard_to_grafana: {
      description: 'Publishes a dashboard to Grafana',
      params: ['dashboard_file', 'vault_username', 'vault_password'],
      actions: [
        {
          do: 'obtain_grafana_api_key vault_username=<%=vault_username%> vault_password=<%=vault_password%>',
          options: { register: 'grafana_api_key' }
        }, {
          do: 'shell',
          command: 'dashee publish grafana <%=dashboard_file%> --grafana-key <%=grafana_api_key%>',
          options: { retry: { retries: 3 } }
        }
      ]
    }
  }
  }