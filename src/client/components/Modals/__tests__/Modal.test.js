import React from 'react';
import { mount, shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ConnectedModal, { Modal } from 'components/Modals/Modal';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Constants from 'components/../constants';

describe('<Modal />', function () {
  let wrapper;
  let store;

  const caa = {
    clientId: '247inc',
    appId: 'referencebot',
    accountId: 'referencebot',
  };

  const modalState = {
    modalName: Constants.modals.createProject,
    header: 'Create a new project',
    closeIconVisible: true,
  };

  const props = {
    caa,
    modalState,
    dispatch: () => {}
  };

  beforeAll(() => {
    // Mock store
    const mockStore = configureStore();
    store = mockStore(fromJS({
      app: {
        ...caa,
        modalState
      },
      projects: {
        projectCreationInProgress: false
      },
      conversations: {
        conversationsAddingInProgress: false
      }
    }));
  });


  afterAll(() => {
    jest.clearAllMocks();
  });

  const getConnectedWrapper = () => mount(
    <Provider store={store}>
      <ConnectedModal />
    </Provider>);

  const getShallowWrapper = (propsObj) => shallow(<Modal
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist - connected component Modal', () => {
      wrapper = getConnectedWrapper();
      expect(wrapper.exists()).toBe(true);
    });

    test('should exist - basic Modal component', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with CreateProject Modal', () => {
      wrapper = shallow(<Modal
        {...props}
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly with Confirmation Modal', () => {
      wrapper = shallow(<Modal
        {...props}
        modalState={{
          modalName: Constants.modals.confirm,
          header: 'Confirm Action',
          message: 'Please confirm the action'
        }}
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly with Progress Modal', () => {
      wrapper = shallow(<Modal
        {...props}
        modalState={{
          modalName: Constants.modals.progress,
        }}
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly with AddToBot Modal', () => {
      wrapper = shallow(<Modal
        {...props}
        modalState={{
          modalName: Constants.modals.addToBot,
        }}
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly with AddToFaq Modal', () => {
      wrapper = shallow(<Modal
        {...props}
        modalState={{
          modalName: Constants.modals.addToFaq,
        }}
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly with Simple Modal for unauthorized user', () => {
      wrapper = shallow(<Modal
        {...props}
        modalState={{
          modalName: Constants.modals.unauthorized,
          message: 'you are unauthorized to access this client',
          header: 'Access Denied',
        }}
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders null when modalState is empty', () => {
      wrapper = shallow(<Modal
        {...props}
        modalState={{}}
      />);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeEach(() => {
      global.window.document.addEventListener = jest.fn();
      global.window.document.removeEventListener = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('componentDidMount', () => {
      test('should add event listener for keydown event', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().componentDidMount();
        expect(global.window.document.addEventListener).toHaveBeenCalledWith('keydown', wrapper.instance().handleEscapeKey, false);
      });
    });

    describe('componentWillUnmount', () => {
      test('should remove event listener for keydown event', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().componentWillUnmount();
        expect(global.window.document.removeEventListener).toHaveBeenCalledWith('keydown', wrapper.instance().handleEscapeKey, false);
      });
    });

    describe('closeModal', () => {
      test('should dispatch action to close modal', () => {
        wrapper = getConnectedWrapper().find(Modal);
        wrapper.instance().closeModal();
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('handleEscapeKey', () => {
      test('should dispatch action to close modal when escape key is pressed', () => {
        wrapper = getConnectedWrapper().find(Modal);
        wrapper.instance().handleEscapeKey({
          keyCode: 27,
          preventDefault: () => {}
        });
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should not dispatch action to close modal when other keys are pressed', () => {
        wrapper = getConnectedWrapper().find(Modal);
        wrapper.instance().handleEscapeKey({
          keyCode: 13,
          preventDefault: () => {}
        });
        expect(store.getActions()).toEqual([]);
      });
    });
  });
});
