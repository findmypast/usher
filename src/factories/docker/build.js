// https://docs.docker.com/engine/reference/commandline/build/

var _ = require('lodash');

var optionBuilders = {
  build_arg: values => _.map(values, item => `--build-arg ${item}`).join(" "),
  cpu_shares: () => '--cpu-shares',
  file: value => `-f ${value}`,
  memory: value => `-m ${value}`,
  no_cache: () => '--no-cache',
  quiet: () => '--q',
  tag: values => _.map(values, item => `-t ${item}`).join(" ")
};

var pathBuilder = (config) => {
  if(config.path){
    return config.path;
  }
  if(config.url){
    return url;
  }
  return ".";
}

module.exports = (config) => {
  var trimmedConfig = _.omit(config, 'path', 'url');
  var options = _.map(trimmedConfig, (value, key) => {
    if(!_.has(optionBuilders, key)){
      throw new Error(`Cannot find ${key} in optionBuilders`);
    };
    return optionBuilders[key](value);
  }).join(" ");
  var path = pathBuilder(config);

  var command = `docker build ${options} ${path}`;
  return command;
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
