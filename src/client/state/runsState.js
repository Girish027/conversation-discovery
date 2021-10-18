import {
  fromJS, List, Map
} from 'immutable';
import { createSelector } from 'reselect';
import { getURLParams } from 'utils/URIUtils';
import { routeNames, getRoute } from 'utils/RouteHelper';
import { push } from 'connected-react-router';
import api from '../utils/api';
import Constants from '../constants';
import Language from '../Language';
import { getCAASelector, setModalIsOpen } from 'state/appState';
import { getActiveProjectId, projectActions } from 'state/projectsState';
import { getAllClusters } from 'state/clusterState';
import { headerActions } from './headerState';
import { selectProject } from './projectsState';
import {
  LOCATION_CHANGE,
  UPDATE_CAA,
  SELECT_ACTIVE_PROJECT,
  SELECT_RUN,
  SET_RUN_COUNT,
} from './types';
import { logAmplitudeEvent } from '../utils/amplitudeUtils';

export const types = {
  CLEAR_ALL_RUNS: 'CLEAR_ALL_RUNS',

  RECEIVE_ALL_RUNS: 'runs/RECEIVE_ALL_RUNS',
  RECEIVE_RUN: 'runs/RECEIVE_RUN',

  CREATE_RUN_START: 'runs/CREATE_RUN_START',
  CREATE_RUN_FAIL: 'runs/CREATE_RUN_FAIL',
  CREATE_RUN_SUCCESS: 'runs/CREATE_RUN_SUCCESS',

  EDIT_RUN_START: 'runs/EDIT_RUN_START',
  EDIT_RUN_FAIL: 'runs/EDIT_RUN_FAIL',
  EDIT_RUN_SUCCESS: 'runs/EDIT_RUN_SUCCESS',

  DELETE_RUN_START: 'runs/DELETE_RUN_START',
  DELETE_RUN_FAIL: 'runs/DELETE_RUN_FAIL',
  DELETE_RUN_SUCCESS: 'runs/DELETE_RUN_SUCCESS',
};

export const stateKey = {
  runs: 'runs',
  selectedRunId: 'selectedRunId',
  trackRuns: 'trackRuns',
  runCount: 'runCount',
};

export const initialRunsState = fromJS({
  // should contain list of runs with all its metadata
  // this is a Immutable List that contains Maps
  runs: List(),
  // id of run currently selected by the user
  selectedRunId: '',
  // indicates whether any run is being validated and hence to be tracked.
  trackRuns: false,
  // indicates whether runs has been loaded.
  runCount: -1,
});

// ACTIONS
export const createRunStart = (runMeta) => ({
  type: types.CREATE_RUN_START,
  runMeta,
});

export const createRunFail = (error) => ({
  type: types.CREATE_RUN_FAIL,
  error,
});

export const createRunSuccess = (run) => ({
  type: types.CREATE_RUN_SUCCESS,
  run,
});

export const onCreateRunFail = (error = {}) => (dispatch) => {
  const { err, message } = error;
  dispatch(createRunFail(Language[err]));
  const runFailure = {
    toolId: Constants.toolName,
    runStatus: Constants.notification.error,
    env: Constants.environment,
  };
  logAmplitudeEvent('IDT_RunFailureEvent', runFailure);
  dispatch(setModalIsOpen(true, {
    modalName: Constants.modals.createRun,
    header: Constants.modalInfo.createRun.header,
    error: message,
    errorType: Language[err] ? Language[err] : message,
  }));
};

export const onCreateRunSuccess = (response = {}) => (dispatch) => {
  dispatch(createRunSuccess(response));
  dispatch(setModalIsOpen(false));
  dispatch(headerActions.showNotificationWithTimer(
    Language.NOTIFICATIONS.runCreated(response.runName),
    Constants.notification.success,
  ));
  const runSuccess = {
    toolId: Constants.toolName,
    runId: response.runId,
    runName: response.runName,
    runStatus: Constants.notification.success,
    env: Constants.environment,
  };
  logAmplitudeEvent('IDT_RunSuccessEvent', runSuccess);
};

export const createRun = (data) => (dispatch, getState) => {
  const state = getState();
  const projectId = getActiveProjectId(state);
  const caa = getCAASelector(state);
  const url = Constants.serverApiUrls.runs({ ...caa, projectId });
  const createRunEvent = {
    toolId: Constants.toolName, projectId, caa, env: Constants.environment
  };
  logAmplitudeEvent('IDT_CreateRunEvent', createRunEvent);
  dispatch(createRunStart({ data, projectId, caa }));

  api.post({
    dispatch,
    getState,
    url,
    data,
    onApiSuccess: onCreateRunSuccess,
    onApiError: onCreateRunFail,
  });
};

export const receiveRun = (run) => ({
  type: types.RECEIVE_RUN,
  run
});

export const onGetRunFail = (error = {}) => (dispatch) => {
  const { err, message } = error;

  const errorMsg = Language[err] ? Language[err] : message;
  dispatch(headerActions.showNotificationWithTimer(errorMsg, Constants.notification.error));
};

export const getRun = (data) => (dispatch, getState) => {
  const url = Constants.serverApiUrls.oneRun(data);
  api.get({
    dispatch,
    getState,
    url,
    onApiSuccess: receiveRun,
    onApiError: onGetRunFail,
  });
};

export const receiveAllRuns = (runsList = []) => ({
  type: types.RECEIVE_ALL_RUNS,
  runsList,
});

export const onGetAllRunsSuccess = (runsList = []) => (dispatch) => {
  // TODO: verify that caa and project Id is matching.
  // User might click on many projects one by one before we get back API response back
  dispatch(receiveAllRuns(runsList));
};

export const getAllRuns = () => (dispatch, getState) => {
  const state = getState();
  const caa = getCAASelector(state);
  const projectId = getActiveProjectId(state);
  if (projectId) {
    const url = Constants.serverApiUrls.runs({ ...caa, projectId });
    api.get({
      dispatch,
      getState,
      url,
      onApiSuccess: onGetAllRunsSuccess,
      onApiError: onGetRunFail,
    });
  }
};

export const updateRunsStatus = () => (dispatch, getState) => {
  const trackRuns = getRunsToTrackSelector(getState());
  if (trackRuns) {
    dispatch(getAllRuns());
  }
};

export const setSelectedRun = (selectedRunId) => ({
  type: SELECT_RUN,
  selectedRunId,
});

export const setRunCount = (runCount) => ({
  type: SET_RUN_COUNT,
  runCount,
});

export const selectRun = (runId) => (dispatch, getState) => {
  dispatch(setSelectedRun(runId));
  dispatch(getAllClusters());
  const state = getState();
  const caa = getCAASelector(state);
  const projectId = getActiveProjectId(state);
  const newRoute = getRoute(routeNames.DISTRIBUTION_GRAPH, { ...caa, projectId, runId });
  dispatch(push(newRoute));
};

export const editRunStart = (data) => ({
  type: types.EDIT_RUN_START,
  data,
});


export const editRunFail = (error) => ({
  type: types.EDIT_RUN_FAIL,
  error,
});

export const onEditRunFail = (error = {}, runId, data, dialog) => (dispatch) => {
  const { err, message } = error;
  dispatch(editRunFail(Language[err]));
  if (dialog) {
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.editRun,
      runId,
      formData: data,
      error: message,
      errorType: Language[err] ? Language[err] : message,
    }));
  }
};

export const editRunSuccess = (run) => ({
  type: types.EDIT_RUN_SUCCESS,
  run,
});

export const onEditRunSuccess = (run, systemProject) => (dispatch) => {
  dispatch(setModalIsOpen(false));
  dispatch(editRunSuccess(run));
  const { runId, runName, runDescription } = run;
  const editRun = {
    toolId: Constants.toolName, runId, runName, runDescription, env: Constants.environment,
  };
  logAmplitudeEvent('IDT_EditRun', editRun);
  if (systemProject.isDeleteProject === true) {
    dispatch(projectActions.deleteProject(systemProject.projectId));
  }
  dispatch(headerActions.showNotificationWithTimer(
    Language.NOTIFICATIONS.runEdited(run.runName),
    Constants.notification.success,
  ));
};

export const editRun = (runId, data, dialog = true, systemProject = {}) => (dispatch, getState) => {
  const state = getState();
  const projectId = getActiveProjectId(state);
  const caa = getCAASelector(state);
  const url = Constants.serverApiUrls.oneRun({ ...caa, projectId, runId });

  dispatch(editRunStart({ data, projectId, caa }));

  api.patch({
    dispatch,
    getState,
    url,
    data,
    onApiSuccess: (run) => onEditRunSuccess(run, systemProject),
    onApiError: (error) => onEditRunFail(error, runId, data, dialog),
  });
};

export const deleteRunStart = (data) => ({
  type: types.DELETE_RUN_START,
  data,
});


export const deleteRunFail = (error) => ({
  type: types.DELETE_RUN_FAIL,
  error,
});

export const deleteRunSuccess = (run) => ({
  type: types.DELETE_RUN_SUCCESS,
  run,
});

export const onDeleteRunSuccess = (response) => (dispatch, getState) => {
  const state = getState();
  const runState = state.get(stateKey.runs);
  const runs = runState.get('runs');

  const deletedRun = runs.filter((run) => run.get('runId') === response.runId).toJS();
  const deletedRunName = (deletedRun.length === 1) ? deletedRun[0].runName : '';
  const deletedRunId = (deletedRun.length === 1) ? deletedRun[0].runId : '';
  const deletedRunProjectId = (deletedRun.length === 1) ? deletedRun[0].projectId : '';
  const deleteRun = {
    toolId: Constants.toolName,
    deletedRunId,
    env: Constants.environment,
  };
  logAmplitudeEvent('IDT_DeleteRun', deleteRun);
  dispatch(deleteRunSuccess(response));
  dispatch(headerActions.showNotificationWithTimer(
    Language.NOTIFICATIONS.runDeleted(deletedRunName),
    Constants.notification.success,
  ));
  dispatch(selectProject(deletedRunProjectId));
};

export const deleteRun = (runId) => (dispatch, getState) => {
  const state = getState();
  const projectId = getActiveProjectId(state);
  const caa = getCAASelector(state);
  const url = Constants.serverApiUrls.oneRun({ ...caa, projectId, runId });

  dispatch(deleteRunStart({ projectId, caa, runId }));

  api.delete({
    dispatch,
    getState,
    url,
    onApiSuccess: onDeleteRunSuccess,
    onApiError: deleteRunFail,
  });
};

// REDUCERS
export const runReducer = (state = initialRunsState, action) => {
  switch (action.type) {
    case types.CLEAR_ALL_RUNS: return initialRunsState;

    case types.RECEIVE_ALL_RUNS: {
      const { runsList } = action;

      let trackRuns = false;
      for (let i = 0; i < runsList.length; i += 1) {
        switch (runsList[i].runStatus) {
          case Constants.status.QUEUED:
          case Constants.status.IN_PROGRESS:
          case Constants.status.VERIFYING:
            trackRuns = true;
            break;
          default:
            trackRuns = false;
            break;
        }
        if (trackRuns) {
          break;
        }
      }

      return state
        .set(stateKey.runs, fromJS(runsList))
        .set(stateKey.trackRuns, trackRuns)
        .set(stateKey.runCount, runsList.length);
    }

    case types.EDIT_RUN_SUCCESS:
    case types.RECEIVE_RUN: {
      const recievedRun = action.run;
      const { runId } = recievedRun;
      const runs = state.get(stateKey.runs);
      const runIndex = runs.findIndex((run) => run.get('runId') === runId);
      let newRuns;
      if (runIndex !== -1) {
        newRuns = runs.set(runIndex, Map(recievedRun));
      } else {
        newRuns = runs.insert(0, Map(recievedRun));
      }
      return state.set(stateKey.runs, newRuns);
    }

    case types.CREATE_RUN_SUCCESS: {
      const newRun = new Map(action.run);
      const runs = state.get(stateKey.runs).insert(0, newRun);
      return state
        .set(stateKey.runs, runs)
        .set(stateKey.trackRuns, true)
        .set(stateKey.runCount, runs.length);
    }

    case types.DELETE_RUN_SUCCESS: {
      const deletedRun = action.run;
      const { runId } = deletedRun;
      const runs = state.get(stateKey.runs);
      const runIndex = runs.findIndex((run) => run.get('runId') === runId);
      const remaining = runIndex !== -1 ? runs.delete(runIndex) : runs;
      return state
        .set(stateKey.runs, remaining)
        .set(stateKey.runCount, remaining.length);
    }

    // The below reducers are handling part of the global state change
    case SELECT_RUN: {
      return state.set(stateKey.selectedRunId, action.selectedRunId);
    }

    case LOCATION_CHANGE: {
      const { search } = action.payload.location;
      const { run: runId } = getURLParams(search);
      return state.set(stateKey.selectedRunId, runId);
    }

    case UPDATE_CAA:
    case SELECT_ACTIVE_PROJECT:
      // clear runs state when CAA or project changes
      return initialRunsState;

    default:
      return state;
  }
};

// SELECTORS
export const getRunsState = (state) => state.get('runs');
export const getSelectedRunId = (state) => getRunsState(state).getIn([stateKey.selectedRunId]);
export const getRunCount = (state) => getRunsState(state).getIn([stateKey.runCount]);
export const getRunsToTrackSelector = (state) => getRunsState(state).getIn([stateKey.trackRuns]);

export const getRunsList = createSelector(
  getRunsState,
  (runsState) => runsState.get(stateKey.runs),
);

export const getSelectedRun = createSelector(
  getSelectedRunId, getRunsList,
  (selectedRunId, runsList) => runsList.find((r) => r.get('runId') === selectedRunId),
);

// SELECTORS TO BE USED IN COMPONENTS
export const runSelectors = {
  getRunsList,
  getSelectedRunId,
  getSelectedRun,
  getRunsToTrackSelector,
  getRunCount,
};

// ACTIONS TO BE DISPATCHED FROM COMPONENTS
export const runActions = {
  createRun,
  getRun,
  getAllRuns,
  updateRunsStatus,
  selectRun,
  editRun,
  deleteRun,
};
