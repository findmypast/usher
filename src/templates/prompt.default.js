'use strict';

module.exports = [
  {
    name: "buildDockerRegistry",
    message: "The docker registry URL"
  },
  {
    name: "buildDockerImage",
    message: "The docker image, e.g. findmypast/usher"
  },
  {
    name: "projectName",
    message: "The name of your project, e.g. usher",
    validate: (value) => {
      return new Promise( (resolve, reject) => {
        if(value.search(/\s/g) !== -1)
          return resolve("projectName cannot contain spaces");
        if(value === '')
            return resolve("projectName cannot be blank");
        return resolve(true);
      });
    }
  },
  {
    name: "clientPort",
    message: "Port the service runs on locally within the container, e.g. 8080",
    validate: (value) => {
      return new Promise( (resolve, reject) => {
        if(value.search(/[^\d]/g) !== -1)
          return resolve("clientPort must be numeric");
        return resolve(true);
      });
    }
  },
  {
    name: "liveHostPort",
    message: "Port the service should run on, on the host machine, e.g. 80",
    validate: (value) => {
      return new Promise( (resolve, reject) => {
        if(value.search(/[^\d]/g) !== -1)
          return resolve("liveHostPort must be numeric");
        return resolve(true);
      });
    }
  },
  {
    name: "remoteDockerAddress",
    message: "Full URL to remote docker daemon, e.g. tcp://example.com:12345"
  },
];
