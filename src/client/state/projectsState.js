import {
  fromJS, List, Map
} from 'immutable';
import { createSelector } from 'reselect';
import _ from 'lodash';
import { getURLParams } from 'utils/URIUtils';
import { routeNames, getRoute } from 'utils/RouteHelper';
import { push } from 'connected-react-router';
import api from '../utils/api';
import Constants from '../constants';
import Language from '../Language';
import { getCAASelector, setModalIsOpen } from './appState';
import { headerActions } from './headerState';
import { getAllRuns, getRunsList, runActions } from 'state/runsState';
import { saveStorage } from '../utils/storageManager';
import { logAmplitudeEvent } from '../utils/amplitudeUtils';

import {
  LOCATION_CHANGE,
  UPDATE_CAA,
  SELECT_ACTIVE_PROJECT,
  SET_PROJECT_COUNT
} from './types';

export const types = {
  CLEAR_ALL_PROJECTS: 'CLEAR_ALL_PROJECTS',

  RECEIVE_ALL_PROJECTS: 'projects/RECEIVE_ALL_PROJECTS',
  RECEIVE_PROJECT: 'projects/RECEIVE_PROJECT',

  CREATE_PROJECT_START: 'projects/CREATE_PROJECT_START',
  CREATE_PROJECT_FAIL: 'projects/CREATE_PROJECT_FAIL',
  CREATE_PROJECT_SUCCESS: 'projects/CREATE_PROJECT_SUCCESS',

  EDIT_PROJECT_START: 'projects/EDIT_PROJECT_START',
  EDIT_PROJECT_FAIL: 'projects/EDIT_PROJECT_FAIL',
  EDIT_PROJECT_SUCCESS: 'projects/EDIT_PROJECT_SUCCESS',

  DELETE_PROJECT_START: 'projects/DELETE_PROJECT_START',
  DELETE_PROJECT_FAIL: 'projects/DELETE_PROJECT_FAIL',
  DELETE_PROJECT_SUCCESS: 'projects/DELETE_PROJECT_SUCCESS',

};

export const stateKey = {
  projects: 'projects',
  activeProjectId: 'activeProjectId',
  trackProjects: 'trackProjects',
  projectRuns: 'projectRuns',
  projectCreationInProgress: 'projectCreationInProgress',
  projectCount: 'projectCount',
};

const projectIdStr = 'projectId';

export const initialProjectState = fromJS({
  // should contain list of projects with all its metadata including dataset name and id
  // this is a Immutable List that contains Maps
  projects: List(),
  // id of project currently selected by the user
  activeProjectId: '',
  // indicates whether any project is being validated and hence to be tracked.
  trackProjects: false,
  // indicates whether a project is being created. Used in create project modal
  projectCreationInProgress: false,
  // indicated whether a project is being loaded.
  projectCount: -1,
});

// ACTIONS
export const createProjectStart = (project) => ({
  type: types.CREATE_PROJECT_START,
  project,
});

export const createProjectFail = (error) => ({
  type: types.CREATE_PROJECT_FAIL,
  error,
});

export const createProjectSuccess = (project) => ({
  type: types.CREATE_PROJECT_SUCCESS,
  project,
});

export const onCreateProjectFail = (error = {}) => (dispatch) => {
  const { err, message } = error;

  dispatch(createProjectFail(Language[err]));
  const projectFailure = {
    toolId: Constants.toolName,
    projectStatus: Constants.notification.error,
    env: Constants.environment,
  };
  logAmplitudeEvent('IDT_ProjectFailureEvent', projectFailure);
  dispatch(setModalIsOpen(true, {
    modalName: Constants.modals.createProject,
    error: message,
    errorType: Language[err] ? Language[err] : message,
  }));
};

export const onCreateProjectSuccess = (response = {}) => (dispatch, getState) => {
  const caa = getCAASelector(getState());
  dispatch(createProjectSuccess(response));
  dispatch(selectProject(response.projectId));
  dispatch(setModalIsOpen(false));
  dispatch(
    headerActions.showNotificationWithTimer(
      Language.NOTIFICATIONS.projectCreated(response.projectName),
      Constants.notification.success,
    )
  );
  dispatch(projectActions.getAllProjects(caa));
  // TODO : log amplitude events
  const projectSuccess = {
    toolId: Constants.toolName,
    projectId: response.projectId,
    projectName: response.projectName,
    projectStatus: Constants.notification.success,
    env: Constants.environment,
  };
  logAmplitudeEvent('IDT_ProjectSuccessEvent', projectSuccess);
};

export const createProject = (data) => (dispatch, getState) => {
  const url = Constants.serverApiUrls.projects(data);

  const {
    projectName, datasetFile, datasetName, projectDescription,
  } = data;
  dispatch(createProjectStart({ projectName }));
  const createProjectEvent = {
    toolId: Constants.toolName,
    projectName,
    datasetName,
    projectDescription,
    env: Constants.environment,
  };
  logAmplitudeEvent('IDT_CreateProjectEvent', createProjectEvent);
  // TODO: get param names from swagger
  const formData = new FormData();
  formData.append('projectName', projectName);
  formData.append('projectDescription', projectDescription);
  formData.append('datasetName', datasetName);
  formData.append('upfile', datasetFile, datasetName);

  api.post({
    dispatch,
    getState,
    url,
    data: formData,
    onApiSuccess: onCreateProjectSuccess,
    onApiError: onCreateProjectFail,
  });
};

export const receiveProject = (project) => ({
  type: types.RECEIVE_PROJECT,
  project
});

export const onGetProjectFail = (error = {}) => (dispatch) => {
  const { err, message } = error;

  const errorMsg = Language[err] ? Language[err] : message;
  dispatch(headerActions.showNotificationWithTimer(errorMsg, Constants.notification.error));
};

export const getProject = (data) => (dispatch, getState) => {
  const url = Constants.serverApiUrls.oneProject(data);
  api.get({
    dispatch,
    getState,
    url,
    onApiSuccess: receiveProject,
    onApiError: onGetProjectFail,
  });
};

export const receiveAllProjects = (projectsList = []) => ({
  type: types.RECEIVE_ALL_PROJECTS,
  projectsList
});

export const onGetAllProjectsSuccess = (projectsList = []) => (dispatch, getState) => {
  dispatch(receiveAllProjects(projectsList));
  const state = getState();
  const activeProjectId = getActiveProjectId(state);
  const runsList = getRunsList(state);
  // load runs only if the state does not have them.
  if (activeProjectId && runsList.size === 0) {
    dispatch(getAllRuns());
  }
};

export const getAllProjects = (data) => (dispatch, getState) => {
  const url = Constants.serverApiUrls.projects(data);
  api.get({
    dispatch,
    getState,
    url,
    onApiSuccess: onGetAllProjectsSuccess,
    onApiError: onGetProjectFail,
  });
};

export const setActiveProject = (activeProjectId) => ({
  type: SELECT_ACTIVE_PROJECT,
  activeProjectId
});

export const setProjectCount = (projectCount) => ({
  type: SET_PROJECT_COUNT,
  projectCount
});

export const selectProject = (projectId) => (dispatch, getState) => {
  dispatch(setActiveProject(projectId));
  dispatch(getAllRuns());
  const caa = getCAASelector(getState());
  const newRoute = getRoute(routeNames.DISCOVER_INTENTS, { ...caa, projectId });
  dispatch(push(newRoute));

  saveStorage(Constants.activeProjectId, projectId);
};

export const editProjectStart = (project) => ({
  type: types.EDIT_PROJECT_START,
  project,
});

export const editProjectFail = (error) => ({
  type: types.EDIT_PROJECT_FAIL,
  error,
});

export const editProjectSuccess = (project) => ({
  type: types.EDIT_PROJECT_SUCCESS,
  project,
});

export const onEditProjectFail = (projectId, data, systemProject, error = {}) => (dispatch) => {
  const { err, message } = error;
  dispatch(editProjectFail(Language[err]));
  if (!systemProject) {
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.editProject,
      projectId,
      formData: data,
      error: message,
      errorType: Language[err] ? Language[err] : message,
    }));
  } else if (err === Constants.PROJECT_ALREADY_EXISTS) {
    dispatch(headerActions.showNotificationWithTimer(Language.SYSTEM_PROJECT_RENAME, Constants.notification.error));
  } else {
    dispatch(headerActions.showNotificationWithTimer(message, Constants.notification.error));
  }
};

export const onEditProjectSuccess = (runId, systemAccess, response = {}) => (dispatch) => {
  dispatch(setModalIsOpen(false));
  dispatch(editProjectSuccess(response));
  const { projectId, projectName } = response;
  const editProject = {
    toolId: Constants.toolName, projectId, projectName, env: Constants.environment
  };
  logAmplitudeEvent('IDT_EditProject', editProject);
  if (systemAccess) {
    dispatch(
      headerActions.showNotificationWithTimer(
        Language.NOTIFICATIONS.projectSysEdited(Constants.LIVE_DATA_ANALYSIS),
        Constants.notification.success
      ));
  } else {
    dispatch(
      headerActions.showNotificationWithTimer(
        Language.NOTIFICATIONS.projectEdited(response.projectName),
        Constants.notification.success
      ));
  }
  if (runId) {
    dispatch(runActions.selectRun(runId));
  }
};

export const editProject = (projectId, data, systemAccess, runId) => (dispatch, getState) => {
  const state = getState();
  const caa = getCAASelector(state);
  let headers;
  const url = Constants.serverApiUrls.oneProject({ ...caa, projectId });
  if (systemAccess) {
    headers = { systemAccess };
  } else {
    headers = { systemAccess: false };
  }

  dispatch(editProjectStart({ data, projectId, caa }));

  api.patch({
    dispatch,
    getState,
    url,
    headers,
    data,
    onApiSuccess: (response) => onEditProjectSuccess(runId, systemAccess, response),
    onApiError: (error) => onEditProjectFail(projectId, data, systemAccess, error),
  });
};

export const deleteProjectStart = (project) => ({
  type: types.DELETE_PROJECT_START,
  project,
});

export const deleteProjectFail = (error) => ({
  type: types.DELETE_PROJECT_FAIL,
  error,
});

export const deleteProjectSuccess = (project) => ({
  type: types.DELETE_PROJECT_SUCCESS,
  project,
});

export const onDeleteProjectSuccess = (response = {}) => (dispatch, getState) => {
  const { projectName, projectId } = response;
  dispatch(deleteProjectSuccess(response));
  dispatch(selectProject(getActiveProjectId(getState())));
  const deleteProject = {
    toolId: Constants.toolName,
    projectId,
    projectName,
    env: Constants.environment,
  };
  logAmplitudeEvent('IDT_DeleteProject', deleteProject);
  // dispatch(getAllRuns())
  dispatch(headerActions.showNotificationWithTimer(
    Language.NOTIFICATIONS.projectDeleted(projectName),
    Constants.notification.success,
  ));
};

export const deleteProject = (projectId) => (dispatch, getState) => {
  const state = getState();
  const caa = getCAASelector(state);
  const url = Constants.serverApiUrls.oneProject({ ...caa, projectId });
  dispatch(deleteProjectStart({ caa, projectId }));

  api.delete({
    dispatch,
    getState,
    url,
    onApiSuccess: onDeleteProjectSuccess,
    onApiError: deleteProjectFail,
  });
};

// REDUCERS
export const projectReducer = (state = initialProjectState, action) => {
  switch (action.type) {
    case types.CLEAR_ALL_PROJECTS: return initialProjectState;

    case types.CREATE_PROJECT_START:
      return state.set(stateKey.projectCreationInProgress, true);

    case types.CREATE_PROJECT_FAIL:
      return state.set(stateKey.projectCreationInProgress, false);

    case types.RECEIVE_ALL_PROJECTS: {
      const { projectsList = [] } = action;
      let trackProjects = false;
      const projectInProgress = projectsList.find((project) => project.status !== Constants.status.ENABLED);
      if (!_.isNil(projectInProgress)) {
        trackProjects = true;
      }

      // select latest project if none or invalid is selected
      let activeProjectId = state.get(stateKey.activeProjectId);
      if (activeProjectId) {
        const valid = projectsList.some((pro) => pro.projectId === activeProjectId);
        if (!valid) {
          activeProjectId = '';
        }
      }
      if (!activeProjectId && projectsList.length) {
        activeProjectId = projectsList[0].projectId;
      }

      return state
        .set(stateKey.projects, fromJS(projectsList))
        .set(stateKey.trackProjects, trackProjects)
        .set(stateKey.activeProjectId, activeProjectId)
        .set(stateKey.projectCount, projectsList.length);
    }
    case types.CREATE_PROJECT_SUCCESS:
    case types.EDIT_PROJECT_SUCCESS:
    case types.RECEIVE_PROJECT: {
      let trackProjects = state.get(stateKey.trackProjects);
      let activeProjectId = state.get(stateKey.activeProjectId);

      const { projectId } = action.project;
      const projects = state.get(stateKey.projects);
      const projectIndex = projects.findIndex((proj) => proj.get(projectIdStr) === projectId);
      let newProjects;
      if (projectIndex !== -1) {
        newProjects = projects.set(projectIndex, Map(action.project));
      } else {
        newProjects = projects.insert(0, Map(action.project));
        // select this project if this is the first project created
        if (projects.size === 1) {
          activeProjectId = action.project.projectId;
          trackProjects = true;
        }
      }
      return state.set(stateKey.projects, newProjects)
        .set(stateKey.trackProjects, trackProjects)
        .set(stateKey.activeProjectId, activeProjectId)
        .set(stateKey.projectCreationInProgress, false)
        .set(stateKey.projectCount, newProjects.size);
    }

    case types.DELETE_PROJECT_SUCCESS: {
      const deletedProject = action.project;
      const { projectId } = deletedProject;
      const projects = state.get(stateKey.projects);
      // Remove from the list of projects
      const indexOfProjectToBeRemoved = projects.findIndex((project) => project.get(projectIdStr) === projectId);
      const remainingProjects = (indexOfProjectToBeRemoved !== -1) ? projects.delete(indexOfProjectToBeRemoved) : projects;

      // Select the first project if this deleted project was active project
      let activeProjectId = state.get(stateKey.activeProjectId);
      if (activeProjectId === projectId) {
        if (remainingProjects.size) {
          activeProjectId = remainingProjects.get(0).get(projectIdStr);
        } else {
          activeProjectId = '';
        }
      }
      return state
        .set(stateKey.projects, remainingProjects)
        .set(stateKey.activeProjectId, activeProjectId)
        .set(stateKey.projectCount, remainingProjects.size);
    }

    // The below reducers are handling part of the global state change
    case SELECT_ACTIVE_PROJECT: {
      return state.set(stateKey.activeProjectId, action.activeProjectId);
    }

    case LOCATION_CHANGE: {
      const { search } = action.payload.location;
      const { project: projectId } = getURLParams(search);
      return state.set(stateKey.activeProjectId, projectId);
    }

    case UPDATE_CAA:
      // clear projects state when CAA changes
      return initialProjectState;

    default:
      return state;
  }
};

// SELECTORS
export const getProjectsState = (state) => state.get('projects');

export const getActiveProjectId = (state) => getProjectsState(state).getIn([stateKey.activeProjectId]);

export const getProjectCount = (state) => getProjectsState(state).getIn([stateKey.projectCount]);
export const getProjectsToTrackSelector = (state) => getProjectsState(state).getIn([stateKey.trackProjects]);
export const getProjectCreationInProgress = (state) => getProjectsState(state).getIn([stateKey.projectCreationInProgress]);

export const getProjectsList = createSelector(
  getProjectsState,
  (projectsState) => projectsState.get(stateKey.projects),
);

export const getActiveProject = createSelector(
  getActiveProjectId, getProjectsList,
  (activeProjectId, projectsList) => projectsList.find((p) => p.get(projectIdStr) === activeProjectId),
);

// SELECTORS TO BE USED IN COMPONENTS
export const projectSelectors = {
  getProjectsList,
  getActiveProject,
  getActiveProjectId,
  getProjectsToTrackSelector,
  getProjectCreationInProgress,
  getProjectCount,
};

// ACTIONS TO BE DISPATCHED FROM COMPONENTS
export const projectActions = {
  createProject,
  getProject,
  getAllProjects,
  selectProject,
  deleteProject,
  editProject,
};
