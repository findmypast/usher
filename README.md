# usher
A command line app to usher our containers to production

#### To do

- [x] Describe the process - [see diagram](#our-standard-build-pipeline)
- [ ] Publish the Usher NPM module to internal registry + NPM task
- [ ] Single command
- [ ] Sequence of commands
- [ ] Team-city configuration
- [ ] Publish docker image to internal registry
- [ ] Usher to publish Usher
- [ ] Plugin for docker commands
- [ ] Plugin for consul commands
- [ ] Migrate Titan to use Usher 

#### Motivations

- I don't like deployment configuration living in continuous integration software
- I believe it should be possible to run the same deployment code from any machine in case the CI goes down
- It makes it easier to test deployments

#### Our standard build pipeline 

![Build Pipeline](./diagrams/img/build-pipeline.png)
