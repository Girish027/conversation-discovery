import React from 'react';
import { mount, shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ConnectedContentPanel from 'components/ContentPanel';
import ContentPanel from 'components/ContentPanel/ContentPanel';
import { routeNames } from 'utils/RouteHelper';

describe('<ContentPanel />', () => {
  let wrapper;
  let store;

  const caa = {
    clientId: '247inc',
    appId: 'referencebot',
    accountId: 'referencebot',
  };

  const props = {
    caa,
    routeName: routeNames.DISCOVER_INTENTS,
  };


  beforeAll(() => {
    // Mock store
    const mockStore = configureStore();
    store = mockStore(fromJS({
      router: {
        location: {
          pathname: routeNames.DISCOVER_INTENTS
        }
      },
      app: {
        ...caa
      },
      projects: {
        activeProjectId: 'pro-123',
        projects: [{projectId: 'pro-123', projectType: 'SYSTEM'}]
      },
      runs: {
        runs: []
      }

    }));
  });


  afterAll(() => {
    jest.clearAllMocks();
  });

  const getWrapper = () => shallow(
    <ContentPanel {...props} />
  );

  const getConnectedWrapper = () => mount(
    <Provider store={store}>
      <ConnectedContentPanel />
    </Provider>);

  describe('Creating an instance', () => {
    test('should exist - connected components', () => {
      wrapper = getConnectedWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    test('should exist - basic', () => {
      wrapper = getWrapper();
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with Runs View', () => {
      wrapper = shallow(<ContentPanel {...props} />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
    test('renders correctly with Topic Distribution View', () => {
      wrapper = shallow(<ContentPanel routeName={routeNames.DISTRIBUTION_GRAPH} />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
    test('renders correctly with Conversations View', () => {
      wrapper = shallow(<ContentPanel routeName={routeNames.TOPIC_REVIEW} />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
    test('renders correctly with Runs View', () => {
      wrapper = shallow(<ContentPanel routeName={routeNames.BASE_ROUTE} />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
    test('renders correctly with Runs View', () => {
      wrapper = shallow(<ContentPanel routeName={routeNames.DISCOVER_INTENTS} />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });
});
