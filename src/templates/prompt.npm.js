'use strict';

module.exports = [
  {
    "name": "buildDockerRegistry",
    "message": "The docker registry URL"
  },
  {
    "name": "buildDockerImage",
    "message": "The docker image for the 'build' task, e.g. findmypast/usher"
  },
  {
    "name": "testCommand",
    "message": "Command to execute your tests",
    "default": "npm test"
  },
  {
    "name": "publishCommand",
    "message": "Command to publish your code",
    "default": "npm run publish-to-npm"
  }
];
