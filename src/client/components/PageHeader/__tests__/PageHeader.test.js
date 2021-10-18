import React from 'react';
import { mount, shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ConnectedPageHeader from 'components/PageHeader';
import PageHeader from 'components/PageHeader/PageHeader';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { routeNames } from 'utils/RouteHelper';

describe('<PageHeader />', function () {
  let wrapper;
  let store;

  const caa = {
    clientId: '247inc',
    appId: 'referencebot',
    accountId: 'referencebot',
  };

  const props = {
    caa,
    dispatch: () => {},
    routeName: routeNames.DISCOVER_INTENTS,
    itsBaseUrl: 'http://its.com',
    activeProject: fromJS({
      projectId: 'pro-abc',
      projectName: 'Project ABC'
    }),
    selectedRun: fromJS({
      runId: 'run-abc',
      runName: 'run ABC'
    }),
  };

  beforeAll(() => {
    // Mock store
    const mockStore = configureStore();
    store = mockStore(fromJS({
      app: {
        ...caa,
        itsBaseUrl: 'http://its.com',
      },
      projects: {
        projects: fromJS([
          {
            projectId: 'pro-123',
            projectName: 'Project 123'
          },
          {
            projectId: 'pro-abc',
            projectName: 'Project ABC'
          },
        ]),
        activeProjectId: 'pro-abc',
      },
      runs: {
        runs: fromJS([
          {
            runId: 'run-123',
            runName: 'run 123'
          },
          {
            runId: 'run-abc',
            runName: 'run ABC'
          },
        ]),
        selectedRunId: 'run-abc',
      },
      router: {
        action: 'PUSH',
        location: {
          pathname: routeNames.DISCOVER_INTENTS
        }
      }
    }));
  });


  afterAll(() => {
    jest.clearAllMocks();
  });

  const getConnectedWrapper = () => mount(
    <Provider store={store}>
      <ConnectedPageHeader />
    </Provider>);

  const getShallowWrapper = (propsObj) => shallow(<PageHeader
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist - connected component PageHeader', () => {
      wrapper = getConnectedWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    test('should exist - basic component PageHeader', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with correct title and breadcrumbs - dicoverIntent', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly with correct title and breadcrumbs - run overview', () => {
      wrapper = getShallowWrapper({ ...props, routeName: routeNames.DISTRIBUTION_GRAPH });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
