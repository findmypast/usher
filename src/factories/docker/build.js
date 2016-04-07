// https://docs.docker.com/engine/reference/commandline/build/

"use strict";

const _ = require('lodash');
const buildCommand = require('../buildCommand');

const executable = "docker build"

const optionMap = {
  build_arg:  values  => _.map(
                          values, item => `--build-arg ${item}`)
                          .join(" "),
  cpu_shares: ()      => '--cpu-shares',
  file:       value   => `-f ${value}`,
  memory:     value   => `-m ${value}`,
  no_cache:   ()      => '--no-cache',
  quiet:      ()      => '--q',
  tags:       values  => _.map(
                          values, item => `-t ${item}`)
                          .join(" ")
};

function getTarget(config) {
  if(config.path) return config.path;
  if(config.url)  return config.url;
  else            return ".";
}

module.exports = (config) => {
  let options = _.omit(config, 'path', 'url');
  let target = getTarget(config);
  return buildCommand(executable, options, optionMap, target);
};

// --build-arg=[]                  Set build-time variables
// --cpu-shares                    CPU Shares (relative weight)
// --cgroup-parent=""              Optional parent cgroup for the container
// --cpu-period=0                  Limit the CPU CFS (Completely Fair Scheduler) period
// --cpu-quota=0                   Limit the CPU CFS (Completely Fair Scheduler) quota
// --cpuset-cpus=""                CPUs in which to allow execution, e.g. `0-3`, `0,1`
// --cpuset-mems=""                MEMs in which to allow execution, e.g. `0-3`, `0,1`
// --disable-content-trust=true    Skip image verification
// -f, --file=""                   Name of the Dockerfile (Default is 'PATH/Dockerfile')
// --force-rm                      Always remove intermediate containers
// --help                          Print usage
// --isolation=""                  Container isolation technology
// -m, --memory=""                 Memory limit for all build containers
// --memory-swap=""                A positive integer equal to memory plus swap. Specify -1 to enable unlimited swap.
// --no-cache                      Do not use cache when building the image
// --pull                          Always attempt to pull a newer version of the image
// -q, --quiet                     Suppress the build output and print image ID on success
// --rm=true                       Remove intermediate containers after a successful build
// --shm-size=[]                   Size of `/dev/shm`. The format is `<number><unit>`. `number` must be greater than `0`.  Unit is optional and can be `b` (bytes), `k` (kilobytes), `m` (megabytes), or `g` (gigabytes). If you omit the unit, the system uses bytes. If you omit the size entirely, the system uses `64m`.
// -t, --tag=[]                    Name and optionally a tag in the 'name:tag' format
// --ulimit=[]
