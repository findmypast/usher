module.exports = {
  version: '3',
  description: 'A series of tasks for reading secrets from a HashiCorp Vault instance using Domesday (https://github.com/findmypast/domesday)',
  vars: { vault_url: 'vault.url' },
  params: {
    vault_secret: 'The path to the secret being requested from vault',
    vault_username: 'The username used to authenticate with vault',
    vault_password: 'The password used to authenticate with vault',
    register_state_key: {
      description: 'The key to register the retrieved secret at in the task state',
      default: 'secret',
      required: false
    }
  },
  tasks: {
    obtain_secret_with_user_pass: {
      description: 'Obtain a secret from Vault using user/pass authentication',
      params: ['vault_secret', 'vault_username', 'vault_password', 'register_state_key'],
      outputs: ['<%=register_state_key%>'],
      actions: [{
        do: 'shell',
        command: 'domesday read-key-value http://<%=vault_username%>:<%=vault_password%>@<%=vault_url%> <%=vault_path%>',
        options: { register: '<%=register_state_key%>' }
      }]
    }
  }
}