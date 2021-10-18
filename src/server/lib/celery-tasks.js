const constants = require('./constants');

const createAddTask = async (celery, taskParametersArray, logger) => {
  return new Promise((resolve, reject) => {
    logger.debug('[CELERY-TASK] createAddTask: begin');
    try {
      const client = celery.getClient();
      logger.info('[CELERY-TASK] createAddTask: client object received, submitting a job');
      
      const task = client.createTask(constants.CELERY_TASK);
      task.call(taskParametersArray);
      resolve();
    } catch (error) {
      logger.error(`[CELERY-TASK] createAddTask: task submittion failed! reason - ${error}`);
      reject(error);
    }
    logger.debug('[CELERY-TASK] createAddTask: end');
  });
};

module.exports = {
  createAddTask
}