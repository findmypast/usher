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

Presets (sequences of commands) are defined in a `.usher.yml` file in the project
root, in the following convention:

```
preset:
  - cmd: command name       # e.g.: "docker build"
    option: value           # e.g.: "force_rm: true"
  - cmd: command name       # e.g.: "docker run"
    option: value           # e.g.: "container_command: npm start"
```

##### Command factories

Usher searches for command factories by path. So a command name of "docker build"
will be interpreted by the factory under factories/docker/build.js

Currently there are factories for:
- docker build
- docker push
- docker pull
- docker run

New factories will be added as needed, usually when the command is complex
enough to warrant configuration management.

If a factory doesn't exist for the command, usher will run the command name
literally in a shell. For example, this will run `npm test`:

```
run_tests:
  cmd: npm test
```

##### Templating

Basic ERB templating can be included in the configuration and it will be parsed as Javascript
when run. The data used to resolve the templates should be passed into the command
line as a series of `key=value` pairs. For more information see the
[lodash template docs](https://lodash.com/docs#template).

```
push:
  cmd: docker push
  registry: docker.io
  image: <%=image_name%>
  tag: <%=version%>

---

$ usher run push image_name=usher version=v1.0.0
```

##### Retries

Any command can be retried on failure with the `retry` option.

```
preset:
  cmd: npm install
  retry:
    attempts: 5
```

##### Ignoring error codes

Usher can treat select non-zero exit codes as success with the `ignore_errors` option.

This is useful when you don't want the failure of one command to terminate the
sequence (or to trigger retries).

```
preset:
  - cmd: rm -r node_modules
    ignore_errors:
      - 1
  - cmd: npm install
```

#### Additional `init` templates

To create a new template to be used with the `init` command, two files are required:
* _src/templates/prompt.**NAME**.js_
* _src/templates/template.**NAME**.yml_

The `js` file should contain [inquirer](https://github.com/SBoudrias/Inquirer.js/) style configuration for each value you need to use in the template. The `yml` file will be expanded into the `.usher.yml` file using [handleBars](https://www.npmjs.com/package/handlebars) templating. Make sure that the names of the handleBar values match the names in the `js` inquirer configuration.

Finally, once both files are present you can use `userh init` **NAME** to use the new template.
