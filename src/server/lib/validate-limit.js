const constants = require('./constants');

const checkProjectLimit = async (clientId, accountId, appId, db, logger) => {
  const projCount = await db.getProjectCountForCAA(clientId, accountId, appId, true);
  if (projCount >= constants.PROJ_LIMIT) {
    logger.info(`Max project limit exceeded! limit set to ${constants.PROJ_LIMIT}`);
    return false;
  }
  return true;
};

const checkRunLimit = async (projectId, db, logger) => {
  const runCount = await db.getRunCountForProject(projectId, true);
  if (runCount >= constants.RUN_LIMIT) {
    logger.info(`Max run limit exceeded! limit set to ${constants.RUN_LIMIT}`);
    return false;
  }
  return true;
};

module.exports = {
  checkProjectLimit,
  checkRunLimit
}