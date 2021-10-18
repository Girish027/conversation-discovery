import Constants from '../constants';
import Language from '../Language';

export const validateLength = (str = '', minLength = 0, maxLength = 10000) => {
  const len = str.trim().length;
  return minLength <= len && len <= maxLength;
};

export const validateProjectDetails = (projectname, datasetName) => validateLength(projectname, 4, 50) && validateLength(datasetName, 5, 50);

export const validateClientProjLimit = (numOfProj) => (numOfProj >= Constants.PROJ_LIMIT);

export const validateClientRunLimit = (numOfRun) => (numOfRun >= Constants.RUN_LIMIT);

export const createProjectValidation = (numOfProj, clientId) => {
  const isValidObj = {
    isValid: true,
    message: ''
  };

  if (!clientId) {
    isValidObj.isValid = false;
    isValidObj.message = Language.ERROR_MESSAGES.clientInfoNotAvailable;
    return isValidObj;
  }

  if (validateClientProjLimit(numOfProj)) {
    isValidObj.isValid = false;
    isValidObj.message = Language.ERROR_MESSAGES.maxProjectNumberExceeded(Constants.PROJ_LIMIT);
    return isValidObj;
  }

  return isValidObj;
};
