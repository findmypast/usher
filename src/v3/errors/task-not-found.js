class TaskNotFoundError extends Error {
  constructor(task) {
    super(`the task ${task} could not be found.\nPlease check your config file.`);
  }
}

module.exports = TaskNotFoundError;