import React from 'react';
import { mount, shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ConnectedProjectsSidebar, { ProjectsSidebar } from 'components/Sidebar/ProjectsSidebar';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

jest.useFakeTimers();

describe('<ProjectsSidebar />', function () {
  let wrapper;
  let store;

  const caa = {
    clientId: '247inc',
    appId: 'referencebot',
    accountId: 'referencebot',
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
      projectStatus: 'QUEUED',
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
      projectStatus: 'READY',
      projectStatusDescription: null,
    }]
  };


  const props = {
    caa,
    projects: fromJS(projectState.projects),
    dispatch: () => {},
    activeProjectId: projectState.activeProjectId,
  };

  beforeAll(() => {
    // Mock store
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    store = mockStore(fromJS({
      app: {
        ...caa,
      },
      projects: projectState
    }));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getConnectedWrapper = () => mount(
    <Provider store={store}>
      <ConnectedProjectsSidebar />
    </Provider>);

  const getShallowWrapper = (propsObj) => shallow(<ProjectsSidebar
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist - connected component ProjectSidebar', () => {
      wrapper = getConnectedWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    test('should exist - basic ProjectSidebar component', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly when there are no projects yet', () => {
      wrapper = getShallowWrapper({ caa });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when there are projects', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when there are projects and one is focused', () => {
      wrapper = getShallowWrapper(props);
      wrapper.setState({
        focusedProjectId: 'pro-36fc7cf1-444d-4f0c-676b-61539088ec2a'
      });
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeAll(() => {
      props.dispatch = jest.fn();
      projectState.getAllProjects = jest.fn(() => 'getAllProjects');
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('getDerivedStateFromProps', () => {
      test('should set activeProjectId and shouldFetchProjects to true when caa has changed', () => {
        const newProps = {
          caa: {
            clientId: 'hilton',
            appId: 'app',
            accountId: 'acc'
          },
          activeProjectId: 'pro-123'
        };
        const existingState = {
          caa,
          shouldFetchProjects: false,
          activeProjectId: ''
        };
        const derivedState = ProjectsSidebar.getDerivedStateFromProps(newProps, existingState);
        expect(derivedState).toEqual({
          ...newProps,
          shouldFetchProjects: true
        });
      });

      test('should set activeProjectId and shouldFetchProjects to false when caa has not changed', () => {
        const newProps = {
          caa,
          activeProjectId: 'pro-123'
        };
        const existingState = {
          caa,
          shouldFetchProjects: true,
          activeProjectId: ''
        };
        const derivedState = ProjectsSidebar.getDerivedStateFromProps(newProps, existingState);
        expect(derivedState).toEqual({
          activeProjectId: 'pro-123',
          shouldFetchProjects: false
        });
      });
    });

    describe('componentDidUpdate', () => {
      test('should dispatch action to get all projects if caa has changed', () => {
        wrapper = getShallowWrapper(props);
        wrapper.setProps({
          caa: {
            clientId: 'new',
            appId: 'app',
            accountId: 'acc'
          }
        });
        expect(props.dispatch).toHaveBeenCalled();
      });
    });

    describe('onClickCreateProject', () => {
      test('should dispatch action to open create propject modal', () => {
        wrapper = getConnectedWrapper().find(ProjectsSidebar);
        wrapper.instance().onClickCreateProject();
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onFocusProjectItem', () => {
      test('should update focused project id if the focus event indicates that it is focus', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().onFocusProjectItem('pro-123', true);
        expect(wrapper.state().focusedProjectId).toEqual('pro-123');
      });

      test('should not update focused project id if the focus event indicates that it is not in focus', () => {
        wrapper = getShallowWrapper(props);
        wrapper.setState({
          focusedProjectId: 'pro-123'
        });
        wrapper.instance().onFocusProjectItem('pro-new', false);
        expect(wrapper.state().focusedProjectId).toEqual('pro-123');
      });
    });

    describe('onSelectProject', () => {
      test('should dispatch action to select the project', () => {
        wrapper = getConnectedWrapper().find(ProjectsSidebar);
        wrapper.instance().onSelectProject('pro-123');
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('clearFocus', () => {
      test('should clear focused project id when mouse leave event occurs on project list', () => {
        wrapper = getShallowWrapper(props);
        wrapper.setState({
          focusedProjectId: 'pro-123'
        });
        wrapper.find('.project-list').simulate('mouseleave');
        expect(wrapper.state().focusedProjectId).toEqual('');
      });
    });
  });
});
