# usher

[![npm](https://img.shields.io/npm/v/usher-cli.svg)](https://www.npmjs.com/package/usher-cli)
[![npm](https://img.shields.io/npm/dm/usher-cli.svg)](https://www.npmjs.com/package/usher-cli)

## Description

A command line app to usher containers to production

Essentially it allows orchestration of lots of different command line applications into a single configuration file.

## Installation

Usher can be installed globally with `npm install -g usher-cli`, allowing presets
to be run by inputting `usher run <preset-name>` on the command line.

If you'd rather not install globally, Usher's runtime is in `src/cli.js`, and `node <path-to-cli.js>` can replace `usher` in all examples.

## Usage

To list presets:

```sh
$ usher list [-f config-file]
-f config-file: File that will be used for configuration. Default usher.yml.
```

To list a preset with further detail (any sub-tasks or sub-actions with descriptions will be listed):

```sh
$ usher list [-f config-file] [preset]
-f config-file: File that will be used for configuration. Default usher.yml.
[preset]: Preset to list in further detail. Preset must match name as listed by usher list.
```

To run a preset:

```sh
$ usher run [-f config-file -q/-v] <task-name> [default-vars]
task-name: Name of the task to run. Required.
default-vars: var=value pairs that will become the default value for variables. Optional.
-f, --file config-file: File that will be used for configuration. Default usher.yml.
-q, --quiet: Quiet mode. Only errors will be logged.
-v, --verbose: Verbose mode.
```

## Configuration

Configuration is defined in a [YAML](http://yaml.org/) or JSON file, by default named `usher.yml`. Configuration consists of named tasks, default variables, and import declarations.

The first line of configuration must contain the property `version: 2` to use the configuration format described below. Files without it not be compatible.

### Tasks

A task is a function that is run with `usher run <task-name>`. In imports tasks can be defined as plain Javascript functions of state, but in configuration they follow this format:

```yaml
tasks:
  my_task:
    description: Runs my task
    do: shell
    log_prefix: PREFIX
    command: echo my task!
    options:
      retry:
        retries: 5
```

Tasks are named objects with the properties:

- `do <String>` Required. The name of the function to execute. This may be a default function, an imported function, or even another task defined in the same file.
- `description <String>` A string describing the task. Will be displayed in `usher list`. Optional, for documentation purposes only.
- `log_prefix` A string that is prefixed to any console log oputput for this task. Useful when multiple calls to the same task are in use.
- `options <Object>` Task-level options like retry. See below for available options.
- Any other properties will be passed onto the do function. Each function will define its own set of named arguments that it will use.
**For the `shell` command, beware that the properties defined in the usher file can overwrite those used by [child_process.exec](https://nodejs.org/api/child_process.html) module. For example, if you define an Usher property called `uid` then the value of this will be used when the  shell command executes (regardless of where the property is defined - it could be defined in a separate task). To avoid confusion, it's best not to create property names that match those used by `child_process.exec`. See the `shell` task below which also lists these properties.**

#### Task options

##### Retry

Retries the task if it fails. Uses the [promise-retry](https://www.npmjs.com/package/promise-retry) package and takes all of its arguments:

- `retries <Number>`: The maximum amount of times to retry the operation. Default is `10`.
- `factor <Number>`: The exponential factor to use. Default is `2`.
- `minTimeout <Number>`: The number of milliseconds before starting the first retry. Default is `1000`.
- `maxTimeout <Number>`: The maximum number of milliseconds between two retries. Default is `Infinity`.
- `randomize <Bool>`: Randomizes the timeouts by multiplying with a factor between `1` to `2`. Default is `false`.

##### Register

Saves the output of the task in a variable. Takes one value, the name of the variable to register to.

```yaml
register: var_name
```

##### Register last

Saves the output of the last task to be run in a variable. Takes one value, the name of the variable to register to.

```yaml
register_last: var_name
```

This will only produce a noticable difference from register when the task it is attached to calls several subtasks. Can be used alongside register.
e.g.

```yaml
version: '2'

tasks:

  subtask:
    do: sequence
    actions:
      - do: shell
        command: echo "foo"
      - do: shell
        command: echo "bar"

  register_task:
    do: sequence
    actions:
      - do: subtask
        options:
          register: everything
          register_last: last_only
```

In the above example the variable everything will be `foo,\nbar` whereas last_only will be `bar`

##### Ignore errors

Errors in this task won't mark it as failed when `ignore_errors` is set to `true`. This is mainly useful for tasks like sequence where execution stops if a task fails. Takes one value, `true` if errors should be ignored, `false` if not (which is the same as the option not being present at all).

#### Task Cleanup

If any of the commands in an Usher task chain fails then Usher will attempt to execute a task named `catch`. Use this to clean up any resouces that may be in an inconsistent state. You can override the name of the catch task by passing `catch_task={task_name}` on the Usher command line.

Similary, a task called `finally` will be called after the Usher task has completed (even after `catch` has completed). Again, you can override this task name by supplying `finally_task={task_name}` on the command line.

Example:

```yaml
version: '2'

tasks:
  my_task:
    do: shell
    command: false        # returns exit code 1
    catch_task: catch     # will default to catch task anyway if this line is missing
    finally_task: finally # same here for finally

  catch:
    do: shell
    command: echo "Caught it!"

  finally:
    do: shell
    command: echo "Finally done!"
```

#### Default tasks

These tasks are always available without having to be imported. Think of them as usher's standard library.

##### Shell

Uses [child_process.exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) to run a command in a shell. Takes the same arguments as `exec`, that is:

- `command <String>` Required. The command to run, with space-separated arguments
- `cwd <String>` Current working directory of the child process
- `env <Object>` Environment key-value pairs
- `encoding <String>` (Default: 'utf8')
- `shell <String>` Shell to execute the command with (Default: '/bin/sh' on UNIX, 'cmd.exe' on Windows, The shell should understand the -c switch on UNIX or /s /c on Windows. On Windows, command line parsing should be compatible with cmd.exe.)
- `timeout <Number>` (Default: 0)
- `maxBuffer <Number>` largest amount of data (in bytes) allowed on stdout or stderr - if exceeded child process is killed (Default: 200*1024)
- `killSignal <String>` (Default: 'SIGTERM')
- `uid <Number>` Sets the user identity of the process.
- `gid <Number>` Sets the group identity of the process.

stdout/stderr will be logged to output. If the command exits with an exit code other than 0, the task will fail.

##### Sequence

Runs a sequence of tasks. Takes a single argument:

- `actions <Array>` Required. The tasks to run. Must be valid task objects (that is, objects with a `do` attribute) or references to valid functions.

If any task fails, the sequence will immediately be interrupted and fail. Following tasks will not run.

##### Parallel

Runs an array of tasks in parallel. Takes a single argument:

- `actions <Array>` Required. The tasks to run. Must be valid task objects (that is, objects with a `do` attribute) or references to valid functions.

The tasks will not be run in order. All tasks will be attempted, but if any one fails the parallel will be marked as failed.

##### For

Runs a task once for each item in an array, putting that item into a given variable. Essentially, this works like a standard foreach loop. Takes the following arguments:

- `every <String>` Required. The variable name to replace with the array item on each iteration.
- `in <Array>` Required. The array to iterate over.
- `exec <String>` Required. The name of the task to run on each iteration.

### Variables

Usher keeps a register of variables. At any given time, the state of a variable is determined by (in hierarchical order):

- The state defined in the `vars` object in the configuration file.
- The state passed in via the command line in `var=value` pairs.
- The state defined in the parent tasks (merged in hierarchical order). If the `register` option is set, it will save the variable in the parent scope of the task in question.
- The state defined in the current task.

#### Dereferencing

Variables are referenced using ERB syntax. If a variable reference is defined as the only value for a property, the full contents of the variable will be inserted. Example:

```yaml
vars:
  hosts:
    - host1
    - host2
tasks:
  deploy_all:
    do: for
    every: host
    in: <%=hosts%>
    exec: deploy
```

Will resolve to:

```yaml
deploy_all:
  do: for
  every: host
  in:
    - host1
    - host2
  exec: deploy
```

In contrast, if the variable reference occurs embedded in a string a string representation of the variable will be interpolated at that point in the string. This allows us to do things like this:

```yaml
vars:
  message: Hello world!
tasks:
  hello:
    do: shell
    command: echo <%=message%>
```

### Include

Tasks can be imported from other files or npm modules. This is done in a root-level `include` block in configuration:

```yaml
include:
  - from: usher-cli-docker
    import:
      - compose as docker-compose
```

`include` takes an array of import statements. These are composed of:

- `from <String>` Required. The source to import from. Accepts any string that `npm install` does, so relative paths, npm modules, git urls...
- `import <Array>` Required. The functions to import. May be simply the names of the functions, or optionally include an `as [local-name]` suffix to import them with a different name than they are declared with in their module.

## Developing

To run in development, if you have Usher already install globally then uninstall it with the below command:

```sh
npm remove -g usher-cli
```

Use `npm link`, this will set your current local Usher as a global package using a symlink.

> [!IMPORTANT]
> Remember to **npm unlink** your development Usher to detach the local version and then re-install the released version.
> Before pushing changes (but after committing), update the version number to ensure the changes are tagged for a new release.

## Publish

You can bump the version with the below command:

```sh
npm version {patch/minor/major}
```

Push your changes and define the new tagged version  the below:

```sh
git push && git push --tags
```

## Version 1 Documentation

Legacy documentation for usher v1 can be found [here](https://github.com/findmypast/usher/blob/v1.3.11/README.md)


## Limitations

### Maximum call stack size exceeded error

Usher recursively templates over and over until there’s nothing left to template. We do this as certain values to template into an underlying task could reference values which then in turn reference another templated value. 

However, if you have the following scenario: 

```
templated_value: <%=templated_value%>-recursion
```

Where a yaml key matches the templated string, and that key is actually being used in an underlying task, then you’ll be stuck in an infinite loop. We're using lodash for templating, so here’s a snippet to explain why this happens:

```js
const _ = require('lodash')

const a = _.template('<%= user %>')

const b = a({
    user: "<%= user %>-recursion"
})

// <%= user %>-recursion
console.log(b)

const c = _.template(b)

const d = c({
    user: "<%= user %>-recursion"
})

// <%= user %>-recursion-recursion
console.log(d)
```

The code block that causes this issue is the recursive templating done [here](https://github.com/findmypast/usher/blob/31fb08288d31e9efb3c282606de58443b31d78df/src/v2/core/state.js#L58): 

This is a won't fix for now, but is something that we could address if we ever do a v3. 

To avoid this issue, don't pass in templated strings that match keys used by internal tasks
