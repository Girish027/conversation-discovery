import React from 'react';
import { mount, shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ConnectedRunsView, { RunsView } from 'components/ContentPanel/RunsView';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Constants from 'components/../constants';
import * as appState from 'state/appState';

jest.mock('state/appState');

describe('<RunsView />', function () {
  let wrapper;
  let store;

  const caa = {
    clientId: '247inc',
    appId: 'referencebot',
    accountId: 'referencebot',
  };

  const runsState = {
    trackRuns: false,
    selectedRun: '',
    runs: [{
      runId: 'run-59da2519-ed17-46ad-8294-1367e287589d',
      projectId: 'pro-3e4c72f8-72cc-4e2d-77bb-11a5a266514c',
      runName: 'test-1564166348646',
      runDescription: 'trial',
      numOfTurns: 4,
      numOfClusters: 400,
      stopWords: '["hello","hilton"]',
      modified: 1564166848680,
      modifiedBy: 'abc@test.com',
      created: 1564166348680,
      createdBy: 'abc@test.com',
      runStatus: 'QUEUED',
      runStatusDescription: 'The run is queued',
      starred: 0
    }, {
      runId: 'run-9dd719a7-4670-4198-5bde-82477be2c5a5',
      projectId: 'pro-3e4c72f8-72cc-4e2d-77bb-11a5a266514c',
      runName: 'test-1564159900138',
      runDescription: 'trial',
      numOfTurns: 4,
      numOfClusters: 400,
      stopWords: '["hello","hilton"]',
      modified: 1564159930153,
      modifiedBy: 'abc@test.com',
      created: 1564159900153,
      createdBy: 'abc@test.com',
      runStatus: 'QUEUED',
      runStatusDescription: 'The run is queued',
      starred: 1
    }]
  };

  const projectState = {
    activeProjectId: 'pro-3e4c72f8-72cc-4e2d-77bb-11a5a266514c',
    projects: [{
      caaId: '247ai-referencebot-referencebot',
      created: 1563227027435,
      createdBy: 'user@247.ai',
      datasetName: 'test.csv',
      modified: 1563227027435,
      modifiedBy: 'user@247.ai',
      projectDescription: 'project A desc',
      projectId: 'pro-3e4c72f8-72cc-4e2d-77bb-11a5a266514c',
      projectName: 'project A',
      projectStatus: 'READY',
      projectStatusDescription: null,
    }, {
      caaId: '247ai-referencebot-referencebot',
      created: 1563216681889,
      createdBy: 'undefined',
      datasetName: 'data.csv',
      modified: 1563216681889,
      modifiedBy: 'user@247.ai',
      projectDescription: 'project B desc',
      projectId: 'pro-36fc7cf1-444d-4f0c-676b-61539088ec2a',
      projectName: 'project B',
      projectStatus: 'QUEUED',
      projectStatusDescription: null,
    }]
  };


  const props = {
    caa,
    activeProjectId: projectState.activeProjectId,
    activeProject: fromJS(projectState.projects[0]),
    runs: fromJS(runsState.runs),
    dispatch: () => {},
    clientId: 'abc',
  };

  beforeAll(() => {
    // Mock store
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    store = mockStore(fromJS({
      app: {
        ...caa,
      },
      projects: projectState,
      runs: runsState,
    }));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getConnectedWrapper = () => mount(
    <Provider store={store}>
      <ConnectedRunsView />
    </Provider>);

  const getShallowWrapper = (propsObj) => shallow(<RunsView
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist - connected component RunsView', () => {
      wrapper = getConnectedWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    test('should exist - basic RunsView component', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly when there are no projects yet', () => {
      wrapper = getShallowWrapper({
        activeProjectId: '',
        runs: fromJS([]),
        activeProject: fromJS({})
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    // TODO: uncomment after CFD-101 - Dataset validation and Project lifecycle
    test('renders correctly when selected project is not yet ENABLED', () => {
      wrapper = getShallowWrapper({
        activeProjectId: 'pro-123',
        runs: fromJS([]),
        activeProject: fromJS({
          projectId: 'pro-123',
          projectStatus: Constants.status.VERIFYING,
        })
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when selected project has FAILED', () => {
      wrapper = getShallowWrapper({
        activeProjectId: 'pro-123',
        runs: fromJS([]),
        activeProject: fromJS({
          projectId: 'pro-123',
          projectStatus: Constants.status.FAILED,
        })
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when selected project is ENABLED, and there are no runs yet', () => {
      wrapper = getShallowWrapper({
        activeProjectId: 'pro-123',
        runs: fromJS([]),
        activeProject: fromJS({
          projectId: 'pro-123',
          projectStatus: Constants.status.ENABLED,
        })
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when selected project is ENABLED, and there are previous runs', () => {
      wrapper = getShallowWrapper({
        activeProjectId: 'pro-3e4c72f8-72cc-4e2d-77bb-11a5a266514c',
        runs: fromJS(runsState.runs),
        activeProject: fromJS({
          projectId: 'pro-3e4c72f8-72cc-4e2d-77bb-11a5a266514c',
          projectStatus: Constants.status.ENABLED,
        })
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeAll(() => {
      props.dispatch = jest.fn();
      appState.setModalIsOpen = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    test('createNewProject', () => {
      appState.setModalIsOpen.mockReturnValue('setModalIsOpen');
      wrapper = getShallowWrapper(props);
      wrapper.instance().createNewProject();
      expect(appState.setModalIsOpen).toHaveBeenCalledWith(true, expect.any(Object));
      expect(props.dispatch).toHaveBeenCalledWith('setModalIsOpen');
      const modalProps = appState.setModalIsOpen.mock.calls[0][1];
      expect(modalProps).toMatchSnapshot();
    });

    test('createNewRun', () => {
      appState.setModalIsOpen.mockReturnValue('setModalIsOpen');
      wrapper = getShallowWrapper(props);
      wrapper.instance().createNewRun();
      expect(appState.setModalIsOpen).toHaveBeenCalledWith(true, expect.any(Object));
      expect(props.dispatch).toHaveBeenCalledWith('setModalIsOpen');
      const modalProps = appState.setModalIsOpen.mock.calls[0][1];
      expect(modalProps).toMatchSnapshot();
    });
  });
});
