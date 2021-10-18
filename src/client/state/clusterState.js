import {
  fromJS, List, Map
} from 'immutable';
import { createSelector } from 'reselect';
import { getURLParams } from 'utils/URIUtils';
import { routeNames, getRoute } from 'utils/RouteHelper';
import { push } from 'connected-react-router';
import api from '../utils/api';
import Constants from '../constants';
import ObjectUtils from 'utils/ObjectUtils';
import { saveStorage, loadStorage } from 'utils/storageManager';
import Language from '../Language';
import { getCAASelector, setModalIsOpen } from 'state/appState';
import { getActiveProjectId } from 'state/projectsState';
import { getSelectedRunId } from 'state/runsState';
import { headerActions } from 'state/headerState';
import { getAllConversations } from 'state/conversationsState';
import {
  LOCATION_CHANGE,
  UPDATE_CAA,
  SELECT_ACTIVE_PROJECT,
  SELECT_RUN,
  SELECT_CLUSTER,
} from './types';


export const types = {
  CLEAR_ALL_CLUSTERS: 'CLEAR_ALL_CLUSTERS',

  RECIEVE_ALL_CLUSTERS: 'clusters/RECIEVE_ALL_CLUSTERS',
  RECIEVE_CLUSTER: 'clusters/RECIEVE_CLUSTER',

  EDIT_CLUSTER_START: 'clusters/EDIT_CLUSTER_START',
  EDIT_CLUSTER_FAIL: 'clusters/EDIT_CLUSTER_FAIL',
  EDIT_CLUSTER_SUCCESS: 'clusters/EDIT_CLUSTER_SUCCESS',

  SET_FILTER: 'clusters/SET_FILTER',
  SET_FILTERED_CLUSTERS: 'clusters/SET_FILTERED_CLUSTERS',
  CLEAR_FILTER: 'clusters/CLEAR_FILTER',
  REFRESH_GRAPH: 'clusters/REFRESH_GRAPH',
};

// TODO:
// DONE- get all cluster - clusterName, suggestedNames, count per cluster, locked,
// DONE - edit a cluster - patch/post - new name + new description
// DONE - lock a cluster - patch/post - locked state
// DONE-  refresh graph - get all cluster
// DONE - persist and reload of filters - set once per view of run.
// DONE - download at graph - download run results
// download at Cluster - download all conversation per cluster
// get all conversations in a cluster
// get transcript for a conversation
//


export const stateKey = {
  clusters: 'clusters',
  selectedClusterId: 'selectedClusterId',
  editedClusterId: 'editedClusterId',
  filters: 'filters',
  filteredClusters: 'filteredClusters',
};

export const initialFilterState = {
  // FILTERS
  finalized: false,
  open: false,
  // filters to be persisted on browser
  similarityCutOff: '',
  volume: {},
  flag: { volume: false, similarityCutOff: false },
  selectedTopFilter: 'Count'
};

export const initialClusterState = fromJS({
  // should contain list of clusters with all its metadata for the selected run
  // this is a Immutable List that contains Maps
  clusters: List(),
  // id of cluster currently selected by the user
  selectedClusterId: '',
  editedClusterId: '',
  filters: loadStorage(Constants.clusterfilters, Map()),
  // TODO:Curation - move Removed Conversations to this level
});

// ACTIONS

export const receiveCluster = (cluster) => ({
  type: types.RECIEVE_CLUSTER,
  cluster
});

export const onGetClusterFail = (error = {}) => (dispatch) => {
  const { err, message } = error;
  const errorMsg = Language[err] ? Language[err] : message;
  dispatch(headerActions.showNotificationWithTimer(errorMsg, Constants.notification.error));
};

export const getCluster = (clusterId) => (dispatch, getState) => {
  const state = getState();
  const data = {
    ...getCAASelector(state),
    projectId: getActiveProjectId(state),
    runId: getSelectedRunId(state),
    clusterId
  };
  const url = Constants.serverApiUrls.oneCluster(data);
  api.get({
    dispatch,
    getState,
    url,
    onApiSuccess: receiveCluster,
    onApiError: onGetClusterFail,
  });
};

export const receiveAllClusters = (clustersList = []) => ({
  type: types.RECIEVE_ALL_CLUSTERS,
  clustersList
});

// Note: this is also triggered every 30 sec from clusterSidebar.
// Maintains locked, count, name, graph data etc up-to-date
export const getAllClusters = () => (dispatch, getState) => {
  const state = getState();
  const caa = getCAASelector(state);
  const projectId = getActiveProjectId(state);
  const runId = getSelectedRunId(state);
  if (runId) {
    const url = Constants.serverApiUrls.clusters({ ...caa, projectId, runId });
    api.get({
      dispatch,
      getState,
      url,
      onApiSuccess: receiveAllClusters,
      onApiError: onGetClusterFail,
    });
  }
};

export const refreshGraph = () => (dispatch) => {
  dispatch({
    type: types.REFRESH_GRAPH
  });
  dispatch(getAllClusters());
};

export const setSelectedCluster = (selectedClusterId) => ({
  type: SELECT_CLUSTER,
  selectedClusterId
});

export const selectCluster = (clusterId) => (dispatch, getState) => {
  dispatch(setSelectedCluster(clusterId));
  dispatch(getAllConversations());
  const state = getState();
  const caa = getCAASelector(state);
  const projectId = getActiveProjectId(state);
  const runId = getSelectedRunId(state);
  const newRoute = getRoute(routeNames.TOPIC_REVIEW, {
    ...caa, projectId, runId, clusterId
  });
  dispatch(push(newRoute));
};

export const editClusterStart = (data) => ({
  type: types.EDIT_CLUSTER_START,
  ...data
});


export const editClusterFail = (error) => ({
  type: types.EDIT_CLUSTER_FAIL,
  error
});

export const onEditClusterFail = (clusterId, data, dialog, error = {}) => (dispatch) => {
  const { err, message } = error;
  dispatch(editClusterFail(Language[err]));
  if (dialog) {
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.editCluster,
      clusterId,
      formData: data,
      error: message,
      errorType: Language[err] ? Language[err] : message,
    }));
  }
  const errorMsg = Language[err] ? Language[err] : message;
  dispatch(headerActions.showNotificationWithTimer(errorMsg, Constants.notification.error));
};

export const editClusterSuccess = (cluster) => ({
  type: types.EDIT_CLUSTER_SUCCESS,
  cluster
});

export const onEditClusterSuccess = (data) => (dispatch, getState) => {
  dispatch(setModalIsOpen(false));
  const state = getState();
  const editedCluster = getEditedCluster(state);
  if (editedCluster) { // scenario: race condition
    const cluster = editedCluster.merge(Map(data)).toJS();
    dispatch(editClusterSuccess(cluster));
    dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.clusterEdited(cluster.clusterName), Constants.notification.success));
  }
};

// To be called on edit name/description or finalizing/opening a cluster
// Format of data:
// Cluster Name and/or description :- { clusterName: <clusterName>, clusterDescription: <clusterDescription> }
// Finalized:- { finalized: <true|false> }
export const editCluster = (clusterId, data, dialog = true) => (dispatch, getState) => {
  const state = getState();
  const projectId = getActiveProjectId(state);
  const runId = getSelectedRunId(state);
  const caa = getCAASelector(state);
  const url = Constants.serverApiUrls.oneCluster({
    ...caa, projectId, runId, clusterId
  });

  dispatch(editClusterStart({
    data, projectId, runId, clusterId, caa
  }));

  api.patch({
    dispatch,
    getState,
    url,
    data,
    onApiSuccess: () => onEditClusterSuccess(data),
    onApiError: (error) => onEditClusterFail(clusterId, data, dialog, error),
  });
};

export const loadFilter = () => (dispatch, getState) => {
  const state = getState();
  const selectedRunId = getSelectedRunId(state);
  const filters = loadStorage(Constants.clusterfilters, {})[selectedRunId] || initialFilterState;
  dispatch(setFilter(filters));
};

export const setFilter = (filters) => (dispatch, getState) => {
  const selectedRunId = getSelectedRunId(getState());
  dispatch({
    type: types.SET_FILTER,
    filters,
    selectedRunId,
  });
  // initialFilterStates.similarityCutOff = filters.similarityCutOff;
  // initialFilterStates.flag = filters.flag;
  // once state is updated, get the state again and update the localStorage too.
  const newFilters = getFilters(getState());
  saveStorage(Constants.clusterfilters, newFilters.toJS());
};

export const setFilteredClusters = (filteredClusters) => (dispatch, getState) => {
  const selectedRunId = getSelectedRunId(getState());
  dispatch({
    type: types.SET_FILTERED_CLUSTERS,
    filteredClusters,
    selectedRunId,
  });
};

export const resetFilter = () => ({
  type: types.CLEAR_FILTER,
});

// REDUCERS
export const clusterReducer = (state = initialClusterState, action) => {
  switch (action.type) {
    case types.CLEAR_ALL_CLUSTERS: return initialClusterState;

    case types.RECIEVE_ALL_CLUSTERS: {
      const { clustersList } = action;
      return state
        .set(stateKey.clusters, fromJS(clustersList));
    }

    case types.RECIEVE_CLUSTER: {
      const recievedCluster = action.cluster;
      const { clusterId } = recievedCluster;
      const clusters = state.get(stateKey.clusters);
      const clusterIndex = ObjectUtils.findIndex(clusters, 'clusterId', clusterId);
      let newClusters = clusters;
      if (clusterIndex !== -1) {
        newClusters = clusters.set(clusterIndex, Map(recievedCluster));
      } else {
        /** do nothing */
        /** Note: if we add Create Cluster feature,
            If clusterId is not found, RECIEVE_CLUSTER/CREATE_SUCCESS should add to cluster
         */
      }
      return state.set(stateKey.clusters, newClusters);
    }

    case types.EDIT_CLUSTER_START: {
      return state.set(stateKey.editedClusterId, action.clusterId);
    }
    case types.EDIT_CLUSTER_FAIL: {
      return state
        .set(stateKey.editedClusterId, '');
    }
    case types.EDIT_CLUSTER_SUCCESS: {
      const editedCluster = action.cluster;
      const { clusterId } = editedCluster;
      const clusters = state.get(stateKey.clusters);
      const clusterIndex = ObjectUtils.findIndex(clusters, 'clusterId', clusterId);
      let newClusters = clusters;
      if (clusterIndex !== -1) {
        newClusters = clusters.set(clusterIndex, Map(editedCluster));
      } else {
        /** do nothing */
        /** Example race condition: deletion of a cluster and editing the same cluster
            can result in race condition.
            GetAllClusters may have updated the clusters in between.
            => the edited clusterId is not present.
            => we should ignore the response of the call
         */
      }
      return state
        .set(stateKey.clusters, newClusters)
        .set(stateKey.editedClusterId, '');
    }

    case types.SET_FILTER: {
      const { selectedRunId, filters } = action;
      const existingFilters = state.get(stateKey.filters);
      let runFilters = existingFilters.get(selectedRunId) || Map();
      runFilters = runFilters.merge(Map(filters));
      const newFilters = existingFilters.set(selectedRunId, runFilters);
      return state.set(stateKey.filters, newFilters);
    }

    case types.SET_FILTERED_CLUSTERS: {
      const { selectedRunId, filteredClusters } = action;
      const newFilters = Map(filteredClusters).set(selectedRunId, filteredClusters);
      return state.set(stateKey.filteredClusters, newFilters);
    }

    case types.CLEAR_FILTER:
      return state.set(stateKey.filters, Map());

    // The below reducers are handling part of the global state change
    case SELECT_CLUSTER: {
      return state.set(stateKey.selectedClusterId, action.selectedClusterId);
    }

    case LOCATION_CHANGE: {
      const { search } = action.payload.location;
      const { cluster: clusterId } = getURLParams(search);
      return state.set(stateKey.selectedClusterId, clusterId);
    }

    case UPDATE_CAA:
    case SELECT_ACTIVE_PROJECT:
    case SELECT_RUN:
      // clear clusters state when CAA, project or run changes
      return initialClusterState.set(stateKey.filters, fromJS(loadStorage(Constants.clusterfilters, {})));

    default:
      return state;
  }
};

// SELECTORS
const findCluster = (clusterId, clustersList) => ObjectUtils.find(clustersList, 'clusterId', clusterId);
export const getClusterState = (state) => state.get('clusters');

export const getSelectedClusterId = (state) => getClusterState(state).getIn([stateKey.selectedClusterId]);
export const getEditedClusterId = (state) => getClusterState(state).getIn([stateKey.editedClusterId]);

export const getClusterList = createSelector(
  getClusterState,
  (clustersState) => clustersState.get(stateKey.clusters),
);

export const getSelectedCluster = createSelector(
  getSelectedClusterId, getClusterList,
  findCluster,
);

export const getEditedCluster = createSelector(
  getEditedClusterId, getClusterList,
  findCluster,
);

export const getFilters = createSelector(
  getClusterState,
  (clustersState) => clustersState.get(stateKey.filters),
);

export const getFilteredClusters = createSelector(
  getClusterState,
  (clustersState) => clustersState.get(stateKey.filteredClusters),
);

// SELECTORS TO BE USED IN COMPONENTS
export const clusterSelectors = {
  getClusterList,
  getSelectedClusterId,
  getSelectedCluster,
  getFilters,
  getFilteredClusters,
};

// ACTIONS TO BE DISPATCHED FROM COMPONENTS
export const clusterActions = {
  getCluster,
  getAllClusters,
  selectCluster,
  editCluster,
  loadFilter,
  setFilter,
  resetFilter,
  refreshGraph,
  setFilteredClusters,
};
