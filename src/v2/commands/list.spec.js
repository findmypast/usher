/* global describe before after beforeEach it expect sandbox mockery _*/
'use strict';

const State = require('../core/state');
const Logger = require('../loggers/quiet');

describe('commands/list', function() {
  let list;
  let result;
  let input;
  const parse = sandbox.stub();
  const file = {
    vars: {
      var: 'wrong',
      var3: 'value3'
    },
    tasks: {
      test_task: {
        do: 'test'
      }
    }
  };
  parse.returns(file);
  const setupResponse = Promise.try(() => {
    return new State({
      tasks: {
        shell: ['Function'],
        sequence: ['Function'],
        parallel: ['Function'],
        for: ['Function'],
        bootstrap_phoenix: {
          description: 'Bootstrap a Phoenix service from nothing to commited to Github and running in TeamCity',
          do: 'phoenix.bootstrap'
        },
        phoenix: {
          tasks: {
            configure_phoenix: {
              description: 'Creating and configuring the Phoenix project',
              do: 'sequence',
              actions: [{
                description: 'Create a Phoenix API service',
                do: 'shell',
                command: 'echo "Y\\n" | mix phoenix.new <%=service_folder%> --no-ecto --no-brunch --no-html'
              }, {
                description: 'Generate the build and deployment infrastructure files',
                do: 'shell',
                command: 'yo torbjorn <%=service_name%> "<%=service_description%>" "<%=integration_hosts%>" "<%=production_hosts%>" -d <%=service_folder%> --force'
              }]
            },
            bootstrap: {
              description: 'Bootstrap a Phoenix service from nothing to commited to Github and running in TeamCity',
              do: 'sequence',
              actions: [{
                do: 'global.git.clone'
              }, {
                do: 'global.node_dependencies.installAll'
              }, {
                do: 'configure_phoenix'
              }, {
                do: 'global.consul.create_key_value_pairs',
                root: 'proxied-services',
                config_filepath: 'config/consul.yml'
              }, {
                do: 'global.consul.create_key_value_pairs',
                root: 'proxied-services/<%=service_name%>/alerts',
                config_filepath: 'config/alerts.yml'
              }, {
                do: 'global.bastion.create_project',
                project_type: 'microservice'
              }, {
                do: 'global.bastion.create_parameter',
                build_configuration_id: 'root',
                parameter_name: 'env.secret_key_base'
              }, {
                do: 'global.docker.publish_docker_image',
                docker_environment: '<%=docker_env%>',
                create_image_extra_args: null
              }, {
                do: 'global.git.push_new_project'
              }, {
                do: 'global.dasher.publish_dashboard',
                config_filepath: 'config/dasher.yml'
              }]
            }
          }
        },
        global: {
          tasks: {
            node_dependencies: {
              tasks: {
                installAll: {
                  description: 'Install all of the dependencies',
                  do: 'sequence',
                  actions: [{
                    do: 'yeoman'
                  }, {
                    do: 'torbjorn'
                  }, {
                    do: 'curtainTwitcher'
                  }, {
                    do: 'bastion'
                  }]
                },
                yeoman: {
                  description: 'install Yeoman',
                  do: 'shell',
                  command: 'sudo npm install yo -g --unsafe-perm'
                },
                torbjorn: {
                  description: 'Install Torbjorn yeoman generator',
                  do: 'shell',
                  command: 'sudo npm install generator-torbjorn@http://npm.findmypast.dun.fh:5001/package/generator-torbjorn/latest -g --unsafe-perm'
                },
                curtainTwitcher: {
                  description: 'Install curtain-twitcher for adding consul keys',
                  do: 'shell',
                  command: 'sudo npm install -g curtain-twitcher'
                },
                bastion: {
                  description: 'Install bastion to create TeamCity projects',
                  do: 'shell',
                  command: 'sudo npm install bastion@http://npm.findmypast.dun.fh:5001/package/bastion/latest -g --unsafe-perm'
                }
              }
            },
            bastion: {
              tasks: {
                create_project: {
                  description: 'Create a TeamCity project and associated configurations',
                  do: 'shell',
                  command: 'bastion create <%=project_type%> <%=service_name%> <%=service_description%>'
                },
                create_parameter: {
                  description: 'Adds a parameter to a TeamCity project',
                  do: 'shell',
                  command: 'bastion parameter <%=service_name%> <%=build_configuration_id%> <%=parameter_name%> <%=secret_key_base%> -p'
                }
              }
            },
            git: {
              tasks: {
                clone: {
                  description: 'Cloning initial git repository',
                  do: 'shell',
                  command: 'git clone git@github.com:findmypast/<%=github_repo%>.git <%=service_folder%>'
                },
                push_new_project: {
                  description: 'Commit and push the project to Github',
                  do: 'sequence',
                  actions: [{
                    description: 'Git add',
                    do: 'shell',
                    command: 'git -C <%=service_folder%> add .'
                  }, {
                    description: 'Commit to git',
                    do: 'shell',
                    command: 'git -C <%=service_folder%> commit -m "<%=git_commit_message%>"'
                  }, {
                    description: 'Push to Github',
                    do: 'shell',
                    command: 'git -C <%=service_folder%> push'
                  }]
                }
              }
            },
            consul: {
              tasks: {
                create_key_value_pairs: {
                  description: 'Configure consul with a set of Key/Value pairs',
                  do: 'shell',
                  command: 'curtain-twitcher <%=consul_host%> <%=root%> <%=service_folder%>/<%=config_filepath%>'
                }
              }
            },
            docker: {
              tasks: {
                publish_docker_image: {
                  description: 'Build and publish the docker image to the internal repository',
                  do: 'sequence',
                  actions: [{
                    do: 'create_image'
                  }, {
                    do: 'push_image'
                  }]
                },
                create_image: {
                  description: 'Build the docker image',
                  do: 'shell',
                  command: 'sudo docker build --force-rm <%=create_image_extra_args%> -t <%=registry%>/findmypast/<%=service_name%>:<%=version%> <%=service_folder%>'
                },
                push_image: {
                  description: 'Push the docker image to our internal repository',
                  do: 'shell',
                  command: 'sudo docker push <%=registry%>/findmypast/<%=service_name%>:<%=version%>'
                },
                pull_image: {
                  description: 'Pull the docker image from the registry',
                  do: 'shell',
                  command: 'docker pull <%=registry%>/findmypast/<%=service_name%>:<%=version%>'
                },
                compose_up_build: {
                  description: 'Bring up the system using docker compose UP',
                  do: 'shell',
                  command: 'docker-compose -f <%=service_folder%>/<%=compose_filename%> up --build <%=service_name%>'
                },
                compose_up_detached: {
                  description: 'Bring up the system using docker compose UP',
                  do: 'shell',
                  command: 'docker-compose -f <%=service_folder%>/<%=compose_filename%> up -d'
                },
                compose_down: {
                  description: 'Bring down the system using docker compose',
                  do: 'shell',
                  command: 'docker-compose -f <%=service_folder%>/<%=compose_filename%> down'
                },
                compose_build: {
                  description: 'Build the system using docker compose',
                  do: 'shell',
                  command: 'docker-compose -f <%=service_folder%>/<%=compose_filename%> build <%=service_name%>'
                },
                compose_run: {
                  description: 'Bring up the system using docker compose RUN',
                  do: 'shell',
                  command: 'docker-compose -f <%=service_folder%>/<%=compose_filename%> run <%=service_name%>'
                }
              }
            },
            dasher: {
              tasks: {
                publish_dashboard: {
                  description: 'Publish the latest dashboards config to the santa api',
                  do: 'shell',
                  command: 'curl -X PUT -F file=@<%=service_folder%>/<%=config_filepath%> production.santa.service.consul:3334/<%=service_name%>'
                },
                delete_dashboard: {
                  description: 'Delete the project\'s dashboards',
                  do: 'shell',
                  command: 'curl -X DELETE production.santa.service.consul:3334/<%=service_name%>'
                }
              }
            }
          }
        }
      },
      registry: 'docker-registry.dun.fh',
      service_name: 'overwatchtestii',
      service_description: 'A Spanners Test server',
      service_folder: '../<%=service_name%>',
      service_tag: null,
      service_node: null,
      mix_env: null,
      integration_hosts: 'fh1-dock10',
      production_hosts: 'fh1-dock10',
      consul_host: 'consul.dun.fh',
      consul_port: 8500,
      secret_key_base: 'QAhB86YIwTi0aApGunOtndfNb0OMMPg14gBizRMvirem2Aie2nrrMg5+PLG60H4d',
      github_repo: 'overwatchtestii',
      version: 'master',
      git_commit_message: 'Initial commit via bootstrap',
      docker_env: ['DOCKER_TLS_VERIFY=1',
          'DOCKER_HOST=tcp://<%=service_node%>.dun.fh:2376',
          'IMAGE=<%=registry%>/findmypast/<%=service_name%>:<%=version%>',
          'MIX_ENV=<%=mix_env%>',
          'SERVICE_NAME=<%=service_name%>',
          'SERVICE_TAGS=<%=service_tag%>',
          'SERVICE_NODE=<%=service_node%>'
      ]
    }, Logger);
  });

  function setup(config, Logger, usherFilePath) {
    return Promise.resolve(setupResponse);
  }

  const validInput = {};
  const expectedTasksWithDescriptions = {
    'bootstrap_phoenix': [ 'Bootstrap a Phoenix service from nothing to commited to Github and running in TeamCity' ],
    'phoenix.configure_phoenix': [ 'Creating and configuring the Phoenix project' ],
    'phoenix.bootstrap': [ 'Bootstrap a Phoenix service from nothing to commited to Github and running in TeamCity' ],
    'global.node_dependencies.installAll': [ 'Install all of the dependencies' ],
    'global.node_dependencies.yeoman': [ 'install Yeoman' ],
    'global.node_dependencies.torbjorn': [ 'Install Torbjorn yeoman generator' ],
    'global.node_dependencies.curtainTwitcher': [ 'Install curtain-twitcher for adding consul keys' ],
    'global.node_dependencies.bastion': [ 'Install bastion to create TeamCity projects' ],
    'global.bastion.create_project': [ 'Create a TeamCity project and associated configurations' ],
    'global.bastion.create_parameter': [ 'Adds a parameter to a TeamCity project' ],
    'global.git.clone': [ 'Cloning initial git repository' ],
    'global.git.push_new_project': [ 'Commit and push the project to Github' ],
    'global.consul.create_key_value_pairs': [ 'Configure consul with a set of Key/Value pairs' ],
    'global.docker.publish_docker_image': [ 'Build and publish the docker image to the internal repository' ],
    'global.docker.create_image': [ 'Build the docker image' ],
    'global.docker.push_image': [ 'Push the docker image to our internal repository' ],
    'global.docker.pull_image': [ 'Pull the docker image from the registry' ],
    'global.docker.compose_up_build': [ 'Bring up the system using docker compose UP' ],
    'global.docker.compose_up_detached': [ 'Bring up the system using docker compose UP' ],
    'global.docker.compose_down': [ 'Bring down the system using docker compose' ],
    'global.docker.compose_build': [ 'Build the system using docker compose' ],
    'global.docker.compose_run': [ 'Bring up the system using docker compose RUN' ],
    'global.dasher.publish_dashboard': [ 'Publish the latest dashboards config to the santa api' ],
    'global.dasher.delete_dashboard': [ 'Delete the project\'s dashboards' ]
  };

  beforeEach(function() {
    sandbox.reset();
  });
  before(function() {
    mockery.enable({ useCleanCache: true });
    mockery.warnOnUnregistered(false);
    mockery.registerMock('./setup', setup);
    mockery.registerMock('./parse', parse);

    list = require('./list');
  });
  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });
  describe('given valid input', function() {
    before(function() {
      input = _.cloneDeep(validInput);
    });
    beforeEach(function() {
      return list(null, input)
      .then(tasksAndTheirDescriptions => {
        result = tasksAndTheirDescriptions;
      });
    });
    it('lists all tasks', function() {
      _.forOwn(expectedTasksWithDescriptions, (value, key) => {
        expect(result[key]).to.deep.equal(value);
      });
    });
  });
});
