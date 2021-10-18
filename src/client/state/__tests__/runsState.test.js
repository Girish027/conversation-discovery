import * as runState from 'state/runsState';
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
import * as amplitudeUtils from '../../utils/amplitudeUtils';

jest.mock('utils/api');
jest.mock('utils/amplitudeUtils');

const {
  runReducer,
  types,
  stateKey
} = runState;

describe('state/Runs:', function () {
  const newRun = {
    app: 'referencebot',
    account: 'referencebot',
    client: '247ai',
    projectId: 'pro-2a9136b9-ec7e-41c7-8d14-4fb525f3b06f',
    runName: 'test-1564104650001',
    runId: 'run-21584ee5-0f74-4151-24bf-aab97cea808e',
    runDescription: 'trial',
    numOfClusters: 400,
    numOfTurns: 4,
    stopWords: '["hello","hilton"]',
    modified: 1564104650045,
    created: 1564104650045,
    runStatus: 'QUEUED',
    runStatusDescription: 'The run is queued',
    starred: 0
  };

  const caa = {
    clientId: '247ai',
    appId: 'referencebot',
    accountId: 'referencebot'
  };

  describe('Run Actions:', function () {
    let store;

    beforeAll(() => {
      const middlewares = [thunk];
      const mockStore = configureStore(middlewares);
      store = mockStore(fromJS({
        projects: fromJS({
          projects: List([{ projectId: 'pro-123', projectName: 'project 123' }]),
          // id of project currently selected by the user
          activeProjectId: 'pro-123',
          // indicates whether any project is being validated and hence to be tracked.
          trackProjects: false,
        }),
        runs: runState.initialRunsState,
        app: {
          ...caa
        }
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('createRunStart:', () => {
      test('should dispatch action to createRunStart', () => {
        store.dispatch(runState.createRunStart(newRun));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('createRunFail:', () => {
      test('should dispatch action to indicate run creation has failed', () => {
        const error = {
          err: 'RUN_ALREADY_EXISTS',
          message: 'Run name already exist'
        };
        store.dispatch(runState.createRunFail(Language[error.err]));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('createRunSuccess:', () => {
      test('should dispatch action to indicate run creation has been successful', () => {
        store.dispatch(runState.createRunSuccess(newRun));
        store.dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.runCreated(newRun.runName), Constants.notification.success));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onCreateRunFail:', () => {
      test('should dispatch actions - createRunFail and set the modal as open', () => {
        const error = {
          err: 'RUN_ALREADY_EXISTS',
          message: 'Run name already exist'
        };
        store.dispatch(runState.onCreateRunFail(Language[error.err]));
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalledTimes(1);
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch actions - empty error createRunFail and set the modal as open', () => {
        store.dispatch(runState.onCreateRunFail());
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalledTimes(1);
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onCreateRunSuccess:', () => {
      test('should dispatch actions to handle all successful creation of run', () => {
        store.dispatch(runState.onCreateRunSuccess(newRun));
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalledTimes(1);
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch actions to handle all successful creation of empty run', () => {
        store.dispatch(runState.onCreateRunSuccess());
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalledTimes(1);
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('createRun:', () => {
      let data = {};
      beforeAll(() => {
        data = {
          runName: 'abcd',
          runDescription: 'description',
          numOfTurns: 3,
          numOfClusters: 400,
          stopWords: JSON.stringify(['hello', 'hilton']),
        };
      });

      test('should dispatch action to indicate run Create start', () => {
        store.dispatch(runState.createRun(data));
        expect(store.getActions()).toMatchSnapshot();
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalledTimes(1);
      });

      test('should make a post call with the correct url and data', () => {
        store.dispatch(runState.createRun(data));
        expect(api.post).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          data: expect.any(Object),
          onApiSuccess: runState.onCreateRunSuccess,
          onApiError: runState.onCreateRunFail,
        });
        expect(api.post.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('receiveRun:', () => {
      test('should dispatch recieve run action', () => {
        store.dispatch(runState.receiveRun(newRun));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onGetRunFail:', () => {
      test('should dispatch actions to show notifications', () => {
        const error = {
          err: 'RUN_NOT_FOUND',
          message: 'Run does not exists'
        };

        const errorMsg = Language[error.err] ? Language[error.err] : error.message;
        store.dispatch(runState.onGetRunFail({}));
        store.dispatch(headerActions.showNotificationWithTimer(errorMsg, Constants.notification.error));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch actions to show notifications', () => {
        store.dispatch(runState.onGetRunFail());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getRun:', () => {
      test('should make get call to get run details', () => {
        const data = {
          ...caa,
          runId: 'run-uuid'
        };
        store.dispatch(runState.getRun(data));
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: runState.receiveRun,
          onApiError: runState.onGetRunFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('receiveAllRuns:', () => {
      test('should dispatch action on recieving runs', () => {
        const runList = [newRun];
        store.dispatch(runState.receiveAllRuns(runList));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch action on recieving empty runs', () => {
        store.dispatch(runState.receiveAllRuns());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onGetAllRunsSuccess:', () => {
      test('should dispatch action on getting all runs', () => {
        const runList = [newRun];
        store.dispatch(runState.onGetAllRunsSuccess(runList));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch action on getting all  empty runs', () => {
        store.dispatch(runState.onGetAllRunsSuccess());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getAllRuns:', () => {
      test('should make get call to get all runs for the caa', () => {
        store.dispatch(runState.getAllRuns(caa));
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: runState.onGetAllRunsSuccess,
          onApiError: runState.onGetRunFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('updateRunsStatus:', () => {
      beforeEach(function () {
        runState.getRunsToTrackSelector = jest.fn();
      });

      test('should dispatch action to get all runs if trackRuns is set to true', () => {
        
        store.dispatch(runState.updateRunsStatus());
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should not dispatch action to get all runs if trackRuns is false', () => {
        
        store.dispatch(runState.updateRunsStatus());
        expect(store.getActions()).toEqual([]);
      });
    });

    describe('setSelectedRun:', () => {
      test('should dispatch action to set the selected run', () => {
        store.dispatch(runState.setSelectedRun('run-uuid'));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('selectRun:', () => {
      test('should dispatch actions on selecting a run', () => {
        store.dispatch(runState.selectRun('run-uuid'));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('editRunStart:', () => {
      test('should dispatch actions indicating edit run started', () => {
        store.dispatch(runState.editRunStart({
          data: {
            runId: 'run-123',
            starred: 1
          },
          projectId: 'pro-123',
          caa: {
            clientId: 'a',
            accountId: 'b',
            appId: 'c'
          }
        }));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('editRunFail:', () => {
      test('should dispatch actions indicating edit run failed', () => {
        store.dispatch(runState.editRunFail({ code: 'dummy', message: 'dummy message' }));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onEditRunSuccess:', () => {
      test('should dispatch actions to close dialog and indicate edit run was successful', () => {
        store.dispatch(runState.onEditRunSuccess(newRun, {}));
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
        store.dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.runEdited(newRun.runName), Constants.notification.success));
        expect(store.getActions()).toMatchSnapshot();
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
      });
    });

    describe('onEditRunFail:', () => {
      const error = { code: 'dummy', message: 'dummy message' };
      const data = {};
      
      test('should dispatch actions to close dialog and indicate edit run failed', () => {
        store.dispatch(runState.onEditRunFail(error, 'runId', data , true));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('editRun:', () => {
      test('should make get call to update run details', () => {
        const runId = 'run-uuid';
        const data = {
          runName: 'new name',
          runDescription: 'new desc',
        };
        store.dispatch(runState.editRun(runId, data));
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

    describe('deleteRunStart:', () => {
      test('should dispatch actions indicating delete run started', () => {
        store.dispatch(runState.deleteRunStart({
          data: {
            runId: 'run-123',
            starred: 1
          },
          projectId: 'pro-123',
          caa: {
            clientId: 'a',
            accountId: 'b',
            appId: 'c'
          }
        }));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('deleteRunSuccess:', () => {
      test('should dispatch actions indicating delete run failed', () => {
        store.dispatch(runState.deleteRunSuccess({ code: 'dummy', message: 'dummy message' }));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onDeleteRunSuccess:', () => {
      test('should dispatch actions to show notification and indicate edit run was successful', () => {
        store.dispatch(runState.onDeleteRunSuccess(newRun));
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
        store.dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.runDeleted(), Constants.notification.success));
        expect(store.getActions()).toMatchSnapshot();
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
      });
    });

    describe('deleteRun:', () => {
      test('should make get call to delete the run', () => {
        const runId = 'run-uuid';
        store.dispatch(runState.deleteRun(runId));
        expect(api.delete).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: runState.onDeleteRunSuccess,
          onApiError: runState.deleteRunFail,
        });
        expect(api.delete.mock.calls[0][0].url).toMatchSnapshot();
      });
    });
  });

  describe('Run Reducers: ', function () {
    test('should return the initial state', () => {
      const newState = runReducer(undefined, {
        type: types.NOOP,
      });
      expect(newState).toEqual(runState.initialRunsState);
    });

    test('CLEAR_ALL_RUNS', () => {
      const currentState = fromJS({
        runs: List(fromJS([{ runId: 'run-uuid' }])),
        selectedRunId: 'run-uuid',
        trackRuns: true,
      });
      const newState = runReducer(currentState, {
        type: types.CLEAR_ALL_RUNS
      });
      expect(newState).toEqual(runState.initialRunsState);
    });

    describe('RECEIVE_ALL_RUNS:', function () {
      test('should set trackRuns to true if any runs are not yet ENABLED', () => {
        const runsList = [{ runId: 'run-uuid', runStatus: Constants.status.QUEUED }];
        const newState = runReducer(undefined, {
          type: types.RECEIVE_ALL_RUNS,
          runsList
        });
        expect(newState.get(stateKey.trackRuns)).toEqual(true);
      });

      test('should set trackRuns to false if all runs are  ENABLED', () => {
        const runsList = [{ runId: 'run-uuid', runStatus: Constants.status.ENABLED }];
        const newState = runReducer(undefined, {
          type: types.RECEIVE_ALL_RUNS,
          runsList
        });
        expect(newState.get(stateKey.trackRuns)).toEqual(false);
      });

      test('should update runsList', () => {
        const runsList = [{
          runId: 'run-latest',
          runStatus: Constants.status.ENABLED
        }, {
          runId: 'run-2nd',
          runStatus: Constants.status.ENABLED
        }];
        const newState = runReducer(undefined, {
          type: types.RECEIVE_ALL_RUNS,
          runsList
        });
        expect(newState.get(stateKey.runs).toJS()).toEqual(runsList);
      });
    });

    describe('RECEIVE_RUN:', function () {
      let currentState;
      let runsList;

      beforeAll(() => {
        runsList = [{
          runId: 'run-latest',
          runStatus: Constants.status.QUEUED
        }, {
          runId: 'run-2nd',
          runStatus: Constants.status.ENABLED
        }];
        currentState = fromJS({
          runs: List(fromJS(runsList)),
          selectedRunId: 'run-2nd',
          trackRuns: true,
        });
      });

      test('should update the run info in state if already present', () => {
        const recievedRun = {
          runId: 'run-latest',
          runStatus: Constants.status.ENABLED
        };
        const newState = runReducer(currentState, {
          type: types.RECEIVE_RUN,
          run: recievedRun
        });
        expect(newState.get(stateKey.runs).get(0).toJS()).toEqual(recievedRun);
      });

      test('should add the run info in state if not present', () => {
        const recievedRun = {
          runId: 'run-new',
          runStatus: Constants.status.ENABLED
        };
        const newState = runReducer(currentState, {
          type: types.RECEIVE_RUN,
          run: recievedRun
        });
        expect(newState.get(stateKey.runs).get(0).toJS()).toEqual(recievedRun);
        expect(newState.get(stateKey.runs).size).toEqual(3);
      });
    });

    describe('EDIT_RUN_SUCCESS:', function () {
      let currentState;
      let runsList;

      beforeAll(() => {
        runsList = [{
          runId: 'run-latest',
          runName: 'run_old',
          runStatus: Constants.status.ENABLED
        }, {
          runId: 'run-2nd',
          runStatus: Constants.status.ENABLED
        }];
        currentState = fromJS({
          runs: List(fromJS(runsList)),
          selectedRunId: 'run-2nd',
          trackRuns: true,
        });
      });

      test('should update the run info in state', () => {
        const editedRun = {
          runId: 'run-latest',
          runName: 'run_new_name',
          runStatus: Constants.status.ENABLED
        };
        const newState = runReducer(currentState, {
          type: types.EDIT_RUN_SUCCESS,
          run: editedRun
        });
        expect(newState.get(stateKey.runs).get(0).toJS()).toEqual(editedRun);
      });
    });

    describe('CREATE_RUN_SUCCESS:', function () {
      let currentState;
      let runsList;

      beforeAll(() => {
        runsList = [{
          runId: 'run-latest',
          runStatus: Constants.status.QUEUED
        }, {
          runId: 'run-2nd',
          runStatus: Constants.status.ENABLED
        }];
        currentState = fromJS({
          runs: List(fromJS(runsList)),
          selectedRunId: 'run-2nd',
          trackRuns: true,
        });
      });

      test('should add the run info in state if not present', () => {
        const newState = runReducer(currentState, {
          type: types.CREATE_RUN_SUCCESS,
          run: newRun
        });
        expect(newState.get(stateKey.runs).get(0).toJS()).toEqual(newRun);
        expect(newState.get(stateKey.runs).size).toEqual(3);
      });

      test('should set trackRuns to true', () => {
        const newState = runReducer(currentState, {
          type: types.CREATE_RUN_SUCCESS,
          run: newRun
        });
        expect(newState.get(stateKey.trackRuns)).toEqual(true);
      });
    });

    describe('DELETE_RUN_SUCCESS:', function () {
      let currentState;
      let runsList;

      beforeAll(() => {
        runsList = [{
          runId: 'run-latest',
          runStatus: Constants.status.QUEUED
        }, {
          runId: 'run-2nd',
          runStatus: Constants.status.ENABLED
        }];
        currentState = fromJS({
          runs: List(fromJS(runsList)),
          selectedRunId: 'run-2nd',
          trackRuns: true,
        });
      });

      test('should remove the run from the list', () => {
        const newState = runReducer(currentState, {
          type: types.DELETE_RUN_SUCCESS,
          run: {
            runId: 'run-latest'
          }
        });
        expect(newState.get(stateKey.runs).size).toEqual(1);
      });
    });

    test('SELECT_RUN', () => {
      const currentState = fromJS({
        runs: List(fromJS([{ runId: 'run-uuid' }])),
        selectedRunId: 'run-uuid',
        trackRuns: true,
      });
      const newState = runReducer(currentState, {
        type: GlobalTypes.SELECT_RUN,
        selectedRunId: 'run-new'
      });
      expect(newState.get(stateKey.selectedRunId)).toEqual('run-new');
    });

    test('LOCATION_CHANGE', () => {
      const currentState = fromJS({
        runs: List(fromJS([{ runId: 'run-uuid' }])),
        selectedRunId: 'run-uuid',
        trackRuns: true,
      });
      const newState = runReducer(currentState, {
        type: GlobalTypes.LOCATION_CHANGE,
        payload: {
          action: 'POP',
          location: {
            search: '?client=247ai&app=refbot&account=refbot&project=pro-123&run=run-id'
          },
        }
      });
      expect(newState.get(stateKey.selectedRunId)).toEqual('run-id');
    });

    test('UPDATE_CAA', () => {
      const currentState = fromJS({
        runs: List(fromJS([{ runId: 'run-uuid' }])),
        selectedRunId: 'run-uuid',
        trackRuns: true,
      });
      const newState = runReducer(currentState, {
        type: GlobalTypes.UPDATE_CAA
      });
      expect(newState).toEqual(runState.initialRunsState);
    });
  });

  describe('Run Selectors:', function () {
    let state;
    const runsList = [{ runId: 'run-uuid' }, { runId: 'run-2nd' }];

    beforeAll(() => {
      state = fromJS({
        runs: fromJS({
          runs: List(fromJS(runsList)),
          trackRuns: false,
          selectedRunId: 'run-uuid',
        })
      });
    });

    test('getRunsState', function () {
      expect(runState.getRunsState(state)).toEqual(state.get('runs'));
    });

    test('getSelectedRunId', function () {
      expect(runState.getSelectedRunId(state)).toEqual('run-uuid');
    });

    test('getRunsToTrackSelector', function () {
      expect(runState.getRunsToTrackSelector(state)).toEqual(false);
    });

    test('getRunsList', function () {
      expect(runState.getRunsList(state).toJS()).toEqual(runsList);
    });

    test('getSelectedRun', function () {
      expect(runState.getSelectedRun(state).toJS()).toEqual(runsList[0]);
    });
  });
});
