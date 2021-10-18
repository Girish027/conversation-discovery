import React from 'react';
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { fromJS, List } from 'immutable';
import ConnectedAddToFaqModal, { AddToFaqModal } from 'components/Modals/AddToFaqModal';
import { conversationActions } from 'state/conversationsState';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
// jest.mock('state/appState');

describe('<AddToFaqModal />', function () {
  let wrapper;
  let store;
  const conversations = [{
    transcriptId: 'qwe-qwe',
    sentenceSet: `Hello! Is it possible to refund an order I canceled through the restaurant $$I was not able to cancel it through door dash but was able to cancel
  through the restaurant . Yes I am. Yes that would be perfect! Thank you so much`,
    originalSimilarity: 0.67,
    originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
    previousCluster: 'previous-cluster-id',
    currentCluster: 'current-cluster-id',
    modifiedBy: 'user1@247.ai',
    modified: 1554930400000,
  }];

  const props = {
    header: 'Add to Answers',
  };

  beforeAll(() => {
    // Mock store
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    store = mockStore(fromJS({
      conversations: {
        interfaces: new List([]),
        faqs: new List([])
      }
    }));
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  const getConnectedWrapper = () => mount(
    <Provider store={store}>
      <ConnectedAddToFaqModal />
    </Provider>);

  const getShallowWrapper = (propsObj) => shallow(<AddToFaqModal
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist', () => {
      wrapper = getConnectedWrapper();
      expect(wrapper.exists()).toBe(true);
    });
    test('should exist', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly with default props', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeEach(() => {
      props.dispatch = jest.fn();
      props.onClickClose = jest.fn();
      props.onClickOk = jest.fn();
      conversationActions.createFaqWithAnswers = jest.fn(() => 'action createFaqWithAnswers');
      conversationActions.updateFaqWithAnswers = jest.fn(() => 'action updateFaqWithAnswers');
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('onClickSubmit', () => {
      test('should dispatch action to create FAQ with right data', () => {
        const initialState = {
          selectedInterface: {
            interfaceID: '2',
            languageID: '1'
          },
          selectedFaq: {
            value: {
              id: '1',
              title: 'Faq'
            },
            __isNew__: true
          },
          selectedConversations: conversations
        };
        wrapper.setState(initialState);
        wrapper.instance().onClickSubmit();

        expect(conversationActions.createFaqWithAnswers).toHaveBeenCalled();
        expect(props.dispatch).toHaveBeenCalledWith('action createFaqWithAnswers');
      });

      test('should dispatch action to update FAQ with right data', () => {
        const initialState = {
          selectedInterface: {
            interfaceID: '2',
            languageID: '1',
            interfaceName: 'TestInterface'
          },
          selectedFaq: {
            value: {
              id: '1',
              title: 'Faq'
            },
            __isNew__: false
          },
          selectedConversations: conversations
        };
        wrapper.setState(initialState);
        wrapper.instance().onClickSubmit();

        expect(conversationActions.updateFaqWithAnswers).toHaveBeenCalled();
        expect(props.dispatch).toHaveBeenCalledWith('action updateFaqWithAnswers');
      });
    });

    describe('onClickCancel', () => {
      test('should dispatch action to cancel AddToAnswers ', () => {
        wrapper.instance().onClickCancel();
        expect(props.onClickClose).toHaveBeenCalled();
      });
    });

    describe('getAllInterfaces', () => {
      test('should get all interfaces - empty list', () => {
        expect(wrapper.instance().getAllInterfaces()).toMatchSnapshot();
      });
    });

    describe('getAllFaqs', () => {
      test('should get all faqs - empty list', () => {
        expect(wrapper.instance().getAllFaqs()).toMatchSnapshot();
      });
    });
  });
});
