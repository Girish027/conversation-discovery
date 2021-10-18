import * as projectState from 'state/projectsState';
import * as runsState from 'state/runsState';
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
  projectReducer,
  types,
  stateKey
} = projectState;

describe('state/Projects:', function () {
  const newProject = {
    projectId: 'pro-uuid-123',
    projectName: 'project abc',
    created: '1554930505916',
    createdBy: 'litta.zachariah@247.ai',
    modified: '1554930505916',
    moifiedBy: 'litta.zachariah@247.ai',
    description: 'project abc description',
    datasetName: 'TrialData.csv',
    projectStatus: 'QUEUED',
    projectStatusDescription: 'QUEUED',
  };

  const runsList = [{
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
  }];

  const caa = {
    clientId: '247ai',
    appId: 'referencebot',
    accountId: 'referencebot'
  };

  describe('Project Actions:', function () {
    let store;

    beforeAll(() => {
      const middlewares = [thunk];
      const mockStore = configureStore(middlewares);
      store = mockStore(fromJS({
        projects: projectState.initialProjectState,
        app: {
          ...caa
        },
        runs: runsState.initialRunsState
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('createProjectStart:', () => {
      test('should dispatch action to createProjectStart', () => {
        store.dispatch(projectState.createProjectStart(newProject));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('createProjectFail:', () => {
      test('should dispatch action to indicate project creation has failed', () => {
        const error = {
          err: 'PROJECT_ALREADY_EXISTS',
          message: 'PROJECT name already exist'
        };
        store.dispatch(projectState.createProjectFail(Language[error.err]));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('createProjectSuccess:', () => {
      test('should dispatch action to indicate project creation has been successful', () => {
        store.dispatch(projectState.createProjectSuccess(newProject));
        store.dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.projectCreated(newProject.projectName)));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onCreateProjectFail:', () => {
      test('should dispatch actions - createProjectFail and set the modal as open', () => {
        const error = {
          err: 'PROJECT_ALREADY_EXISTS',
          message: 'PROJECT name already exist'
        };
        store.dispatch(projectState.onCreateProjectFail(Language[error.err]));
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch actions - createProjectFail and set the modal as open ,empty err', () => {
        store.dispatch(projectState.onCreateProjectFail());
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onCreateProjectSuccess:', () => {
      test('should dispatch actions to handle all successful creation of project', () => {
        store.dispatch(projectState.onCreateProjectSuccess(newProject));
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch actions to handle all successful creation of project - empty response', () => {
        store.dispatch(projectState.onCreateProjectSuccess());
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('createProject:', () => {
      let data = {};
      let datasetFile;
      beforeAll(() => {
        datasetFile = new File(['trial'], 'trial.csv', {
          type: 'text/csv',
        });
        data = {
          projectName: 'abcd',
          projectDescription: 'description',
          datasetName: 'trial.csv',
          datasetFile,
          ...caa
        };
      });

      test('should dispatch action to indicate project Create start', () => {
        store.dispatch(projectState.createProject(data));
        expect(store.getActions()).toMatchSnapshot();
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
      });

      test('should make a post call with the correct url and data', () => {
        store.dispatch(projectState.createProject(data));
        expect(api.post).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          data: expect.any(FormData),
          onApiSuccess: projectState.onCreateProjectSuccess,
          onApiError: projectState.onCreateProjectFail,
        });
        expect(api.post.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('receiveProject:', () => {
      test('should dispatch recieve project action', () => {
        store.dispatch(projectState.receiveProject(newProject));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onGetProjectFail:', () => {
      test('should dispatch actions to show notifications', () => {
        const error = {
          err: 'PROJECT_DOES_NOT_EXISTS',
          message: 'Project does not exists'
        };

        const errorMsg = Language[error.err] ? Language[error.err] : error.message;
        store.dispatch(projectState.onGetProjectFail({}));
        store.dispatch(headerActions.showNotificationWithTimer(errorMsg, Constants.notification.error));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch actions to show notifications - err empty', () => {
        store.dispatch(projectState.onGetProjectFail());
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch actions to show notifications - err empty', () => {
        const error = {
          err: 'PROJECT_DOES_NOT_EXISTS',
          message: 'Project does not exists'
        };

        const errorMsg = Language[error.err] ? Language[error.err] : error.message;
        store.dispatch(projectState.onGetProjectFail(error));
        expect(store.getActions()).toMatchSnapshot();
        store.dispatch(headerActions.showNotificationWithTimer(errorMsg, Constants.notification.error));
      });
    });

    describe('getProject:', () => {
      test('should make get call to get project details', () => {
        const data = {
          ...caa,
          projectId: 'pro-uuid'
        };
        store.dispatch(projectState.getProject(data));
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: projectState.receiveProject,
          onApiError: projectState.onGetProjectFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('receiveAllProjects:', () => {
      test('should dispatch action on recieving projects', () => {
        const projectList = [newProject];
        store.dispatch(projectState.receiveAllProjects(projectList));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch action on recieving projects', () => {
        store.dispatch(projectState.receiveAllProjects());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onGetAllProjectsSuccess:', () => {
      beforeEach(function () {
        projectState.getActiveProjectId = jest.fn();
        runsState.getRunsList = jest.fn();
      });

      test('should dispatch action on getting all projects', () => {
        // projectState.getActiveProjectId.mockImplementation(() => 'pro-uuid');
        // runsState.getRunsList.mockImplementation(() => runsList);
        const projectList = [newProject];
        store.dispatch(projectState.onGetAllProjectsSuccess(projectList));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch action on getting all projects', () => {
        // projectState.getActiveProjectId.mockImplementation(() => 'pro-uuid');
        // runsState.getRunsList.mockImplementation(() => []);
        store.dispatch(projectState.onGetAllProjectsSuccess());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getAllProjects:', () => {
      test('should make get call to get all projects for the caa', () => {
        store.dispatch(projectState.getAllProjects(caa));
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: projectState.onGetAllProjectsSuccess,
          onApiError: projectState.onGetProjectFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('setActiveProject:', () => {
      test('should dispatch action to set the active project', () => {
        store.dispatch(projectState.setActiveProject('pro-uuid'));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('selectProject:', () => {
      test('should dispatch actions on selecting a project', () => {
        store.dispatch(projectState.selectProject('pro-uuid'));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('editProjectStart:', () => {
      test('should dispatch actions indicating edit project started', () => {
        store.dispatch(projectState.editProjectStart({
          data: {
            projectName: 'testproject',
            projectDescription: 'test desc'
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

    describe('editProjectFail:', () => {
      test('should dispatch actions indicating edit project failed', () => {
        store.dispatch(projectState.editProjectFail({ code: 'dummy', message: 'dummy message' }));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onEditProjectSuccess:', () => {
      test('should dispatch actions to close dialog and indicate edit project was successful', () => {
        store.dispatch(projectState.onEditProjectSuccess(newProject));
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
        store.dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.projectEdited(newProject.projectName), Constants.notification.success));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch actions to close dialog and indicate edit project was successful', () => {
        store.dispatch(projectState.onEditProjectSuccess());
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
        store.dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.projectEdited(newProject.projectName), Constants.notification.success));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onEditProjectFail:', () => {
      const error = { code: 'dummy', message: 'dummy message' };
      const data = {};
      
      test('should dispatch actions to close dialog and indicate edit project failed', () => {
        store.dispatch(projectState.onEditProjectFail('proId', data, error));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch actions to close dialog and indicate edit project failed', () => {
        store.dispatch(projectState.onEditProjectFail('proId', data));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('editProject:', () => {
      test('should make get call to update project details', () => {
        const projectId = 'project-uuid';
        const data = {
          projectName: 'new name',
          projectDescription: 'new desc',
        };
        store.dispatch(projectState.editProject(projectId, data));
        expect(api.patch).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          data: expect.any(Object),
          headers: expect.any(Object),
          onApiSuccess: expect.any(Function),
          onApiError: expect.any(Function),
        });
        expect(api.patch.mock.calls[0][0].data).toEqual(data);
        expect(api.patch.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('deleteProjectStart:', () => {
      test('should dispatch actions indicating delete project started', () => {
        store.dispatch(projectState.deleteProjectStart({
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

    describe('deleteProjectFail:', () => {
      test('should dispatch actions indicating delete project failed', () => {
        store.dispatch(projectState.deleteProjectFail({ code: 'dummy', message: 'dummy message' }));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onDeleteProjectSuccess:', () => {
      test('should dispatch actions to show notification and indicate edit project was successful', () => {
        store.dispatch(projectState.onDeleteProjectSuccess(newProject));
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
        store.dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.projectDeleted(), Constants.notification.success));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch actions to show notification and indicate edit project was successful', () => {
        store.dispatch(projectState.onDeleteProjectSuccess());
        expect(amplitudeUtils.logAmplitudeEvent).toHaveBeenCalled();
        store.dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.projectDeleted(), Constants.notification.success));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('deleteProject:', () => {
      test('should make get call to delete the project', () => {
        const projectId = 'project-uuid';
        store.dispatch(projectState.deleteProject(projectId));
        expect(api.delete).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: projectState.onDeleteProjectSuccess,
          onApiError: projectState.deleteProjectFail,
        });
        expect(api.delete.mock.calls[0][0].url).toMatchSnapshot();
      });
    });
  });

  describe('Project Reducers: ', function () {
    test('should return the initial state', () => {
      const newState = projectReducer(undefined, {
        type: types.NOOP,
      });
      expect(newState).toEqual(projectState.initialProjectState);
    });

    test('CLEAR_ALL_PROJECTS', () => {
      const currentState = fromJS({
        projects: List(fromJS([{ projectId: 'pro-uuid' }])),
        activeProjectId: 'pro-uuid',
        trackProjects: true,
      });
      const newState = projectReducer(currentState, {
        type: types.CLEAR_ALL_PROJECTS
      });
      expect(newState).toEqual(projectState.initialProjectState);
    });

    describe('RECEIVE_ALL_PROJECTS:', function () {
      test('should set trackProjects to true if any projects are not yet ENABLED', () => {
        const projectsList = [{ projectId: 'pro-uuid', status: Constants.status.VERIFYING }];
        const newState = projectReducer(undefined, {
          type: types.RECEIVE_ALL_PROJECTS,
          projectsList
        });
        expect(newState.get(stateKey.trackProjects)).toEqual(true);
      });

      test('should set trackProjects to false if all projects are  ENABLED', () => {
        const projectsList = [{ projectId: 'pro-uuid', status: Constants.status.ENABLED }];
        const newState = projectReducer(undefined, {
          type: types.RECEIVE_ALL_PROJECTS,
          projectsList
        });
        expect(newState.get(stateKey.trackProjects)).toEqual(false);
      });

      test('should set activeProjectId to latest project if none are selected', () => {
        const projectsList = [{
          projectId: 'pro-latest',
          projectStatus: Constants.status.ENABLED
        }, {
          projectId: 'pro-2nd',
          projectStatus: Constants.status.ENABLED
        }];
        const newState = projectReducer(undefined, {
          type: types.RECEIVE_ALL_PROJECTS,
          projectsList
        });
        expect(newState.get(stateKey.activeProjectId)).toEqual('pro-latest');
      });

      test('should not update activeProjectId to latest project if already selected', () => {
        const projectsList = [{
          projectId: 'pro-latest',
          projectStatus: Constants.status.ENABLED
        }, {
          projectId: 'pro-2nd',
          projectStatus: Constants.status.ENABLED
        }];
        const currentState = fromJS({
          projects: List(fromJS([{ projectId: 'pro-2nd' }])),
          activeProjectId: 'pro-2nd',
          trackProjects: true,
        });
        const newState = projectReducer(currentState, {
          type: types.RECEIVE_ALL_PROJECTS,
          projectsList
        });
        expect(newState.get(stateKey.activeProjectId)).toEqual('pro-2nd');
      });

      test('should update projectsList', () => {
        const projectsList = [{
          projectId: 'pro-latest',
          projectStatus: Constants.status.ENABLED
        }, {
          projectId: 'pro-2nd',
          projectStatus: Constants.status.ENABLED
        }];
        const newState = projectReducer(undefined, {
          type: types.RECEIVE_ALL_PROJECTS,
          projectsList
        });
        expect(newState.get(stateKey.projects).toJS()).toEqual(projectsList);
      });
    });

    describe('RECEIVE_PROJECT:', function () {
      let currentState;
      let projectsList;

      beforeAll(() => {
        projectsList = [{
          projectId: 'pro-latest',
          projectStatus: Constants.status.QUEUED
        }, {
          projectId: 'pro-2nd',
          projectStatus: Constants.status.ENABLED
        }];
        currentState = fromJS({
          projects: List(fromJS(projectsList)),
          activeProjectId: 'pro-2nd',
          trackProjects: true,
        });
      });

      test('should update the project info in state if already present', () => {
        const recievedProject = {
          projectId: 'pro-latest',
          projectStatus: Constants.status.ENABLED
        };
        const newState = projectReducer(currentState, {
          type: types.RECEIVE_PROJECT,
          project: recievedProject
        });
        expect(newState.get(stateKey.projects).get(0).toJS()).toEqual(recievedProject);
      });

      test('should add the project info in state if not present', () => {
        const recievedProject = {
          projectId: 'pro-new',
          projectStatus: Constants.status.ENABLED
        };
        const newState = projectReducer(currentState, {
          type: types.RECEIVE_PROJECT,
          project: recievedProject
        });
        expect(newState.get(stateKey.projects).get(0).toJS()).toEqual(recievedProject);
        expect(newState.get(stateKey.projects).size).toEqual(3);
      });
    });

    describe('CREATE_PROJECT_SUCCESS:', function () {
      let currentState;
      let projectsList;

      beforeAll(() => {
        projectsList = [{
          projectId: 'pro-latest',
          projectStatus: Constants.status.QUEUED
        }, {
          projectId: 'pro-2nd',
          projectStatus: Constants.status.ENABLED
        }];
        currentState = fromJS({
          projects: List(fromJS(projectsList)),
          activeProjectId: 'pro-2nd',
          trackProjects: true,
        });
      });

      test('should add the project info in state if not present', () => {
        const newState = projectReducer(currentState, {
          type: types.CREATE_PROJECT_SUCCESS,
          project: newProject
        });
        expect(newState.get(stateKey.projects).get(0).toJS()).toEqual(newProject);
        expect(newState.get(stateKey.projects).size).toEqual(3);
      });

      test('should set trackProjects to true', () => {
        const newState = projectReducer(currentState, {
          type: types.CREATE_PROJECT_SUCCESS,
          project: newProject
        });
        expect(newState.get(stateKey.trackProjects)).toEqual(true);
      });
    });

    describe('EDIT_PROJECT_SUCCESS:', function () {
      let currentState;
      let projectsList;

      beforeAll(() => {
        projectsList = [{
          projectId: 'project-latest',
          projectName: 'project_old',
          projectStatus: Constants.status.ENABLED
        }, {
          projectId: 'project-2nd',
          projectStatus: Constants.status.ENABLED
        }];
        currentState = fromJS({
          projects: List(fromJS(projectsList)),
          selectedProjectId: 'project-2nd',
          trackProjects: true,
        });
      });

      test('should update the project info in state', () => {
        const editedProject = {
          projectId: 'project-latest',
          projectName: 'project_new_name',
          projectStatus: Constants.status.ENABLED
        };
        const newState = projectReducer(currentState, {
          type: types.EDIT_PROJECT_SUCCESS,
          project: editedProject
        });
        expect(newState.get(stateKey.projects).get(0).toJS()).toEqual(editedProject);
      });
    });

    describe('DELETE_PROJECT_SUCCESS:', function () {
      let currentState;
      let projectsList;

      beforeAll(() => {
        projectsList = [{
          projectId: 'project-latest',
          projectStatus: Constants.status.QUEUED
        }, {
          projectId: 'project-2nd',
          projectStatus: Constants.status.ENABLED
        }];
        currentState = fromJS({
          projects: List(fromJS(projectsList)),
          selectedProjectId: 'project-2nd',
          trackProjects: true,
        });
      });

      test('should remove the project from the list', () => {
        const newState = projectReducer(currentState, {
          type: types.DELETE_PROJECT_SUCCESS,
          project: {
            projectId: 'project-latest'
          }
        });
        expect(newState.get(stateKey.projects).size).toEqual(1);
      });
    });


    test('SELECT_ACTIVE_PROJECT', () => {
      const currentState = fromJS({
        projects: List(fromJS([{ projectId: 'pro-uuid' }])),
        activeProjectId: 'pro-uuid',
        trackProjects: true,
      });
      const newState = projectReducer(currentState, {
        type: GlobalTypes.SELECT_ACTIVE_PROJECT,
        activeProjectId: 'pro-new'
      });
      expect(newState.get(stateKey.activeProjectId)).toEqual('pro-new');
    });

    test('LOCATION_CHANGE', () => {
      const currentState = fromJS({
        projects: List(fromJS([{ projectId: 'pro-uuid' }])),
        activeProjectId: 'pro-uuid',
        trackProjects: true,
      });
      const newState = projectReducer(currentState, {
        type: GlobalTypes.LOCATION_CHANGE,
        payload: {
          action: 'POP',
          location: {
            search: '?client=247ai&app=refbot&account=refbot&project=pro-route'
          },
        }
      });
      expect(newState.get(stateKey.activeProjectId)).toEqual('pro-route');
    });

    test('UPDATE_CAA', () => {
      const currentState = fromJS({
        projects: List(fromJS([{ projectId: 'pro-uuid' }])),
        activeProjectId: 'pro-uuid',
        trackProjects: true,
      });
      const newState = projectReducer(currentState, {
        type: GlobalTypes.UPDATE_CAA
      });
      expect(newState).toEqual(projectState.initialProjectState);
    });
  });

  describe('Project Selectors:', function () {
    let state;
    const projectsList = [{ projectId: 'pro-uuid' }, { projectId: 'pro-2nd' }];

    beforeAll(() => {
      state = fromJS({
        projects: fromJS({
          projects: List(fromJS(projectsList)),
          trackProjects: false,
          activeProjectId: 'pro-uuid',
        })
      });
    });

    test('getProjectsState', function () {
      expect(projectState.getProjectsState(state)).toEqual(state.get('projects'));
    });

    test('getActiveProjectId', function () {
      expect(projectState.getActiveProjectId(state)).toEqual('pro-uuid');
    });

    test('getProjectsToTrackSelector', function () {
      expect(projectState.getProjectsToTrackSelector(state)).toEqual(false);
    });

    test('getProjectsList', function () {
      expect(projectState.getProjectsList(state).toJS()).toEqual(projectsList);
    });

    test('getActiveProject', function () {
      expect(projectState.getActiveProject(state).toJS()).toEqual(projectsList[0]);
    });
  });
});
