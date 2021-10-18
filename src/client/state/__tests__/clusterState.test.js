import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import api from 'utils/api';
import * as GlobalTypes from 'state/types';
import {
  fromJS, List
} from 'immutable';
import Constants from 'components/../constants';
import Language from '../../Language';
import { headerActions } from '../headerState';
import * as clusterState from 'state/clusterState';
import { saveStorage } from 'utils/storageManager';

jest.mock('utils/api');

const {
  clusterReducer,
  types,
  stateKey
} = clusterState;

describe('state/Clusters:', function () {
  const clusters = [{
    clusterId: '1',
    clusterName: 'cancel_order_customer_service', // this is the one getting edited
    originalName: 'cancel_order_customer_service',
    clusterDescription: 'relates to cancel order',
    rollupCluster: 'Cancel_Order',
    suggestedNames: ['cancel_order_customer_service', 'abcde', 'defg'],
    count: 230,
    modifiedBy: 'user1@247.ai',
    modified: 1554930400000,
    finalized: false,
    finalizedOn: undefined,
    finalizedBy: '',
  }, {
    clusterId: '2',
    clusterName: 'Cancel_Order',
    originalName: 'Cancel_Order',
    clusterDescription: 'order canceled',
    rollupCluster: 'Cancel_Order',
    suggestedNames: ['cancel_order_service', 'abcde', 'defg'],
    count: 400,
    modifiedBy: 'user1@247.ai',
    modified: 1554930400000,
    finalized: false,
    finalizedOn: undefined,
    finalizedBy: '',
  }, {
    clusterId: '3',
    clusterName: 'size_and_position',
    originalName: 'size_and_position',
    clusterDescription: 'relates to size and position',
    rollupCluster: 'Store_Location',
    suggestedNames: ['position_size', 'store_location', 'defg'],
    count: 142,
    modifiedBy: 'user1@247.ai',
    modified: 1554930400000,
    finalized: true,
    finalizedOn: undefined,
    finalizedBy: 'user1@247.ai',
  }, {
    clusterId: '4',
    clusterName: 'Place_Order',
    originalName: 'Place_Order',
    clusterDescription: 'relates to cancel order',
    rollupCluster: 'Place_Order',
    suggestedNames: ['multiple_order', 'abcde', 'defg'],
    count: 129,
    modifiedBy: 'user1@247.ai',
    modified: 1554930400000,
    finalized: false,
    finalizedOn: undefined,
    finalizedBy: '',
  }];

  const filteredClusters = [{
    clusterId: '1',
    clusterName: 'cancel_order_customer_service', // this is the one getting edited
    originalName: 'cancel_order_customer_service',
    clusterDescription: 'relates to cancel order',
    rollupCluster: 'Cancel_Order',
    suggestedNames: ['cancel_order_customer_service', 'abcde', 'defg'],
    count: 230,
    modifiedBy: 'user1@247.ai',
    modified: 1554930400000,
    finalized: false,
    finalizedOn: undefined,
    finalizedBy: '',
  }, {
    clusterId: '2',
    clusterName: 'Cancel_Order',
    originalName: 'Cancel_Order',
    clusterDescription: 'order canceled',
    rollupCluster: 'Cancel_Order',
    suggestedNames: ['cancel_order_service', 'abcde', 'defg'],
    count: 400,
    modifiedBy: 'user1@247.ai',
    modified: 1554930400000,
    finalized: false,
    finalizedOn: undefined,
    finalizedBy: '',
  }];

  const caa = {
    clientId: '247ai',
    appId: 'referencebot',
    accountId: 'referencebot'
  };

  describe('Cluster Actions:', function () {
    let store;

    beforeAll(() => {
      const middlewares = [thunk];
      const mockStore = configureStore(middlewares);
      store = mockStore(fromJS({
        app: {
          ...caa
        },
        projects: fromJS({
          projects: List([{ projectId: 'pro-123', projectName: 'project 123' }]),
          activeProjectId: 'pro-123',
          trackProjects: false,
        }),
        runs: fromJS({
          runs: List([{ runId: 'run-123', projectName: 'run 123' }]),
          selectedRunId: 'run-123',
          trackRuns: false,
        }),
        clusters: {
          ...clusterState.initialClusterState.toJS(),
          clusters: fromJS(clusters),
          editedClusterId: '2',
        },
        conversations: {
          selectedTranscriptId: ''
        }
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('receiveCluster:', () => {
      test('should dispatch recieve cluster', () => {
        store.dispatch(clusterState.receiveCluster(clusters[0]));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onGetClusterFail:', () => {
      test('should dispatch actions to show notifications', () => {
        const error = {
          err: 'CLUSTER_DOES_NOT_EXISTS',
          message: 'Cluster does not exist'
        };

        const errorMsg = Language[error.err] ? Language[error.err] : error.message;
        store.dispatch(clusterState.onGetClusterFail({}));
        store.dispatch(headerActions.showNotificationWithTimer(errorMsg, Constants.notification.error));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getCluster:', () => {
      test('should make get call to get cluster details', () => {
        store.dispatch(clusterState.getCluster('2'));
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: clusterState.receiveCluster,
          onApiError: clusterState.onGetClusterFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('receiveAllClusters:', () => {
      test('should dispatch action on recieving all clusters', () => {
        store.dispatch(clusterState.receiveAllClusters(clusters));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getAllClusters:', () => {
      test('should make get call to get all clusters for the caa', () => {
        store.dispatch(clusterState.getAllClusters());
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: clusterState.receiveAllClusters,
          onApiError: clusterState.onGetClusterFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('refreshGraph:', () => {
      test('should make get call to get all runs for the caa', () => {
        store.dispatch(clusterState.refreshGraph());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setSelectedCluster:', () => {
      test('should dispatch the select cluster action', () => {
        store.dispatch(clusterState.setSelectedCluster('3'));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('selectCluster:', () => {
      test('should dispatch select cluster and push new route', () => {
        store.dispatch(clusterState.selectCluster('3'));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setFilteredClusters:', () => {
      test('should dispatch select setFilteredClusters and push new route', () => {
        store.dispatch(clusterState.setFilteredClusters(filteredClusters));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('editClusterStart:', () => {
      test('should dispatch to indicate edit cluster started', () => {
        const data = {
          data: {
            finalized: true,
          },
          projectId: 'pro-123',
          runId: 'run-123',
          caa,
        };
        store.dispatch(clusterState.editClusterStart(data));
        expect(store.getActions()).toMatchSnapshot();
      });
    });


    describe('editClusterFail:', () => {
      test('should dispatch to indicate edit cluster failed', () => {
        const error = {
          err: 'CLUSTER_DUPLICATE_NAME',
          message: 'Duplicate name for Topic'
        };
        store.dispatch(clusterState.editClusterFail(error));
        expect(store.getActions()).toMatchSnapshot();
      });
    });


    describe('onEditClusterFail:', () => {
      test('should dispatch to indicate edit cluster failed , open modal and show notification', () => {
        const error = {
          err: 'CLUSTER_DUPLICATE_NAME',
          message: 'Duplicate name for Topic'
        };
        const data = {
          clusterName: 'newName',
        };
        store.dispatch(clusterState.onEditClusterFail('2', data, true, error));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch to indicate edit cluster failed', () => {
        const error = {
          err: 'INTERNAL_ERROR',
          message: 'Something went wrong. Please contact team'
        };
        const data = {
          finalized: false,
        };
        store.dispatch(clusterState.onEditClusterFail('2', data, false, error));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('editClusterSuccess:', () => {
      test('should dispatch to indicate edit cluster success', () => {
        store.dispatch(clusterState.editClusterSuccess(clusters[0]));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('editClusterSuccess:', () => {
      test('should dispatch to indicate edit cluster success', () => {
        store.dispatch(clusterState.editClusterSuccess(clusters[0]));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onEditClusterSuccess:', () => {
      test('should dispatch for handling successful updation of cluster', () => {
        const data = {
          clusterName: 'newName'
        };
        store.dispatch(clusterState.onEditClusterSuccess(data));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('editCluster:', () => {
      test('should make get call to edit the given cluster', () => {
        const data = {
          clusterName: 'newName'
        };
        store.dispatch(clusterState.editCluster('2', data));
        expect(api.patch).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          data: expect.any(Object),
          onApiSuccess: expect.any(Function),
          onApiError: expect.any(Function),
        });
        expect(api.patch.mock.calls[0][0].data).toEqual(data);
        expect(api.patch.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('loadFilter:', () => {
      test('should load from localstorage and set the filter', () => {
        const filters = {
          'run-123': {
            finalized: true
          }
        };
        saveStorage(Constants.clusterfilters, JSON.stringify(filters));

        store.dispatch(clusterState.loadFilter(filters));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should  set the default filter state', () => {
        const filters = {
          'run-456': {
            finalized: true
          }
        };
        saveStorage(Constants.clusterfilters, JSON.stringify(filters));
        store.dispatch(clusterState.loadFilter(filters));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setFilter:', () => {
      test('should update state', () => {
        const filters = {
          finalized: true
        };
        store.dispatch(clusterState.setFilter(filters));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('resetFilter:', () => {
      test('should reset filter state', () => {
        store.dispatch(clusterState.resetFilter());
        expect(store.getActions()).toMatchSnapshot();
      });
    });
  });

  describe('Cluster Reducers: ', function () {
    const clustersList = [{
      clusterId: '1',
      clusterName: 'abc'
    }, {
      clusterId: '2',
      clusterName: 'bcd'
    }];


    test('should return the initial state', () => {
      const newState = clusterReducer(undefined, {
        type: types.NOOP,
      });
      expect(newState).toEqual(clusterState.initialClusterState);
    });

    test('CLEAR_ALL_CLUSTERS', () => {
      const currentState = fromJS({
        clusters: List(fromJS([{ clusterId: '1' }])),
        selectedClusterId: '1',
        filters: {
          'run-123': {
            finalized: true,
          }
        }
      });
      const newState = clusterReducer(currentState, {
        type: types.CLEAR_ALL_CLUSTERS
      });
      expect(newState).toEqual(clusterState.initialClusterState);
    });

    describe('RECEIVE_ALL_CLUSTERS:', function () {
      test('should update clustersList', () => {
        const newState = clusterReducer(undefined, {
          type: types.RECIEVE_ALL_CLUSTERS,
          clustersList
        });
        expect(newState.get(stateKey.clusters).toJS()).toEqual(clustersList);
      });
    });

    describe('RECEIVE_CLUSTER:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          clusters: List(fromJS(clustersList)),
          selectedClusterId: '2',
          filter: {}
        });
      });

      test('should update the cluster info in state if already present', () => {
        const recieved = {
          clusterId: '1',
          clusterName: 'abc-new'
        };
        const newState = clusterReducer(currentState, {
          type: types.RECIEVE_CLUSTER,
          cluster: recieved
        });
        expect(newState.get(stateKey.clusters).get(0).toJS()).toEqual(recieved);
      });
    });

    describe('EDIT_CLUSTER_START:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          clusters: List(fromJS(clustersList)),
          selectedClusterId: '2',
          filters: {}
        });
      });

      test('should update the cluster in state and clear editedClusterId', () => {
        const newState = clusterReducer(currentState, {
          type: types.EDIT_CLUSTER_START,
          clusterId: '2'
        });
        expect(newState.get(stateKey.editedClusterId)).toEqual('2');
      });
    });

    describe('EDIT_CLUSTER_FAIL:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          clusters: List(fromJS(clustersList)),
          selectedClusterId: '2',
          editedCluster: '1',
          filters: {}
        });
      });

      test('should update the cluster in state and clear editedClusterId', () => {
        const newState = clusterReducer(currentState, {
          type: types.EDIT_CLUSTER_FAIL,
        });
        expect(newState.get(stateKey.editedClusterId)).toEqual('');
      });
    });

    describe('EDIT_CLUSTER_SUCCESS:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          clusters: List(fromJS(clustersList)),
          selectedClusterId: '2',
          editedCluster: '1',
          filters: {}
        });
      });

      test('should update the cluster in state and clear editedClusterId', () => {
        const edited = {
          clusterId: '1',
          clusterName: 'cluster_new_name',
        };
        const newState = clusterReducer(currentState, {
          type: types.EDIT_CLUSTER_SUCCESS,
          cluster: edited
        });
        expect(newState.get(stateKey.clusters).get(0).toJS()).toEqual(edited);
        expect(newState.get(stateKey.editedClusterId)).toEqual('');
      });
    });

    describe('SET_FILTER:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          clusters: List(fromJS(clustersList)),
          selectedClusterId: '2',
          filters: {},
        });
      });

      test('should update the filter state', () => {
        const filters = {
          finalized: true
        };
        const newState = clusterReducer(currentState, {
          type: types.SET_FILTER,
          filters,
          selectedRunId: 'run-123',
        });
        expect(newState.get(stateKey.filters).toJS()).toEqual({ 'run-123': filters });
      });
    });

    describe('SET_FILTERED_CLUSTERS:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          clusters: List(fromJS(clustersList)),
          selectedClusterId: '2',
          filteredClusters: [],
        });
      });

      test('should update the flitered clusters', () => {
        const newState = clusterReducer(currentState, {
          type: types.SET_FILTERED_CLUSTERS,
          filteredClusters,
          selectedRunId: 'run-123',
        });
        expect(newState.get(stateKey.filteredClusters).toJS()).toEqual({ 'run-123': filteredClusters });
      });
    });

    describe('CLEAR_FILTER:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          clusters: List(fromJS(clustersList)),
          selectedClusterId: '2',
          filters: {
            'run-123': {
              finalized: true,
            }
          }
        });
      });

      test('should reset the filter state', () => {
        const newState = clusterReducer(currentState, {
          type: types.CLEAR_FILTER,
        });
        expect(newState.get(stateKey.filters).toJS())
          .toEqual({});
      });
    });

    test('SELECT_CLUSTER', () => {
      const currentState = fromJS({
        clusters: List(fromJS(clustersList)),
        selectedClusterId: '2',
        filters: {}
      });
      const newState = clusterReducer(currentState, {
        type: GlobalTypes.SELECT_CLUSTER,
        selectedClusterId: '1'
      });
      expect(newState.get(stateKey.selectedClusterId)).toEqual('1');
    });

    test('LOCATION_CHANGE', () => {
      const currentState = fromJS({
        clusters: List(fromJS(clustersList)),
        selectedClusterId: '5',
        filters: {}
      });
      const newState = clusterReducer(currentState, {
        type: GlobalTypes.LOCATION_CHANGE,
        payload: {
          action: 'POP',
          location: {
            search: '?client=247ai&app=refbot&account=refbot&project=pro-123&run=run-id&cluster=2'
          },
        }
      });
      expect(newState.get(stateKey.selectedClusterId)).toEqual('2');
    });

    test('UPDATE_CAA', () => {
      const currentState = fromJS({
        clusters: List(fromJS(clustersList)),
        selectedClusterId: '5',
        filters: {}
      });
      const newState = clusterReducer(currentState, {
        type: GlobalTypes.UPDATE_CAA
      });
      expect(newState).toEqual(clusterState.initialClusterState);
    });

    test('SELECT_ACTIVE_PROJECT', () => {
      const currentState = fromJS({
        clusters: List(fromJS(clustersList)),
        selectedClusterId: '5',
        filters: {
        }
      });
      const newState = clusterReducer(currentState, {
        type: GlobalTypes.SELECT_ACTIVE_PROJECT
      });
      expect(newState).toEqual(clusterState.initialClusterState);
    });

    test('SELECT_RUN', () => {
      const currentState = fromJS({
        clusters: List(fromJS(clustersList)),
        selectedClusterId: '5',
        filters: {
        }
      });
      const newState = clusterReducer(currentState, {
        type: GlobalTypes.SELECT_RUN
      });
      expect(newState).toEqual(clusterState.initialClusterState);
    });
  });

  describe('ClusterSelectors Selectors:', function () {
    let state;
    const clustersList = [{ clusterId: '1' }, { clusterId: '2' }];
    const filters = {
      'run-123': {
        finalized: false
      }
    };
    beforeAll(() => {
      state = fromJS({
        clusters: {
          clusters: fromJS(clustersList),
          selectedClusterId: '1',
          editedClusterId: '2',
          filters: fromJS(filters),
          filteredClusters
        }
      });
    });

    test('getClusterState', function () {
      expect(clusterState.getClusterState(state)).toEqual(state.get('clusters'));
    });

    test('getSelectedClusterId', function () {
      expect(clusterState.getSelectedClusterId(state)).toEqual('1');
    });

    test('getEditedClusterId', function () {
      expect(clusterState.getEditedClusterId(state)).toEqual('2');
    });

    test('getClusterList', function () {
      expect(clusterState.getClusterList(state).toJS()).toEqual(clustersList);
    });

    test('getSelectedCluster', function () {
      expect(clusterState.getSelectedCluster(state).toJS()).toEqual(clustersList[0]);
    });

    test('getEditedCluster', function () {
      expect(clusterState.getEditedCluster(state).toJS()).toEqual(clustersList[1]);
    });

    test('getFilters', function () {
      expect(clusterState.getFilters(state).toJS()).toEqual(filters);
    });

    test('getFilteredClusters', function () {
      expect(clusterState.getFilteredClusters(state).toJS()).toEqual(filteredClusters);
    });
  });
});
