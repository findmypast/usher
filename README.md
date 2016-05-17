# usher

[![npm](https://img.shields.io/npm/v/usher-cli.svg?maxAge=2592000)](https://www.npmjs.com/package/usher-cli)
[![npm](https://img.shields.io/npm/dm/usher-cli.svg)](https://www.npmjs.com/package/usher-cli)

### WARNING: still in active development

#### Description

A command line app to usher containers to production

Essentially it allows orchestration of lots of different command line applications into a single configuration file.

#### Installation

Usher can be installed globally with `npm install -g usher-cli`, allowing presets
to be run by inputting `usher run <preset-name>` on the command line.

If you'd rather not install globally, Usher's runtime is in `src/cli.js`, and `node <path-to-cli.js>` can replace `usher` in all examples.

#### Set up
To generate a generic usher configuration for your project, run:
```
usher init
```
This will prompt for data regarding the containers and their configuration required for the project. An `.usher.yml` file will be created in your project.

#### Usage

```
$ usher run [-f config-file] <preset-name> [templating-data]
```

##### Configuration

Tasks (sequences of commands) are defined in a `.usher.yml` file in the project
root, in the following convention:

```
tasks:
  preset:
    - cmd: command name       # e.g.: "docker build"
      option: value           # e.g.: "ignore_errors: true"
    - cmd: command name       # e.g.: "docker run"
      option: value           
```

##### Templating

Tasks can insert variables defined in ERB syntax (`<%=var_name%>`). Usher will
search for the variable names first from key=value pairs passed through the
command line and then from a `vars:` block at the top of the YAML file.

```
vars:
  registry: docker-registry.dun.fh
  image: findmypast/usher

tasks:
  build:
    - cmd: docker build --force-rm -t <%=registry%>/<%=image%>:<%=version%> .
---

$ usher run build version=v1.0.0
```

You can also run tasks as commands, and pass the subtask its own array of
variables:

```
  preset:
    - cmd: command name
      option: value
    - task: other_preset
      vars:
        variable_name: value
```

Commands can save their result (everything in the command's `stdout`) to a
variable for use by following commands in the same task using the `register`
option.

```
  preset:
    - cmd: docker ps -q
      register: containers
    - cmd: docker rm <%=containers%>
```

##### Ignoring error codes

Usher can treat select non-zero exit codes as success with the `ignore_errors` option.

This is useful when you don't want the failure of one command to terminate the
sequence.

```
preset:
  - cmd: rm -r node_modules
    ignore_errors: true
  - cmd: npm install
```

##### Passing environment variables

Environment variables can be set for each command by passing in a list of
key=value pairs to the `environment:` option.

```
publish:
  - cmd: docker run --name usher-publisher --rm <%=registry%>/<%=image%>:<%=version%> npm run publish-to-npm
    environment:
      - NPM_USER=<%=user%>
      - NPM_PASSWORD=<%=password%>
      - NPM_EMAIL=<%=email%>
```
