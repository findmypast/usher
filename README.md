# usher

### WARNING: still in active development

![Usher badge](https://img.shields.io/circleci/project/findmypast/usher/master.svg)

#### Description

A command line app to usher our containers to production

Essentially it allows orchestration of lots of different command line applications into a single configuration file.

#### To do

- [x] Describe the build pipeline - [see diagram](#our-standard-build-pipeline)
- [x] Flow chart of how Usher works - [see diagram](#run)
- [x] Publish the Usher NPM module to registry
- [ ] Circle CI with badge
- [ ] Single command
- [ ] Sequence of commands
- [ ] Retry commands
- [ ] Passing exit codes
- [ ] Public CI for publishing NPM package
- [ ] Publish docker image to internal registry
- [ ] Usher to publish Usher

#### Motivations

- I don't like deployment configuration living in continuous integration software
- I believe it should be possible to run the same deployment code from any machine in case the CI goes down
- It makes it easier to test deployments

#### Usher flow chart

![usher run flow-chart](./diagrams/img/run.png)

#### Our standard build pipeline

![Build Pipeline](./diagrams/img/build-pipeline.png)
