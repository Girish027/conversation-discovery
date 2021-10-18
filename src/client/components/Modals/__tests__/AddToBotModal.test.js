import React from 'react';
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import { fromJS, List } from 'immutable';
import ConnectedAddToBotModal, { AddToBotModal } from 'components/Modals/AddToBotModal';
import { conversationActions } from 'state/conversationsState';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
// jest.mock('state/appState');

describe('<AddToBotModal />', function () {
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
    header: 'Add to Conversations',
  };

  beforeAll(() => {
    // Mock store
    const middlewares = [thunk];
    const mockStore = configureStore(middlewares);
    store = mockStore(fromJS({
      conversations: {
        intents: new List([])
      }
    }));
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  const getConnectedWrapper = () => mount(
    <Provider store={store}>
      <ConnectedAddToBotModal />
    </Provider>);

  const getShallowWrapper = (propsObj) => shallow(<AddToBotModal
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
      conversationActions.createIntentWithConversations = jest.fn(() => 'action createIntentWithConversations');
      conversationActions.updateIntentWithConversations = jest.fn(() => 'action updateIntentWithConversations');
      wrapper = getShallowWrapper(props);
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('onClickSubmit', () => {
      test('should dispatch action to create intent with right data', () => {
        const initialState = {
          selectedIntent: {
            value: 'nodeName',
            __isNew__: true
          },
          selectedConversations: conversations
        };
        wrapper.setState(initialState);
        wrapper.instance().onClickSubmit();

        expect(conversationActions.createIntentWithConversations).toHaveBeenCalled();
        expect(props.dispatch).toHaveBeenCalledWith('action createIntentWithConversations');
      });

      test('should dispatch action to update intent with right data', () => {
        const initialState = {
          selectedIntent: {
            value: {
              nodeId: '1',
              nodeName: 'nodeName',
              utterances: []
            },
            __isNew__: false
          },
          selectedConversations: conversations
        };
        wrapper.setState(initialState);
        wrapper.instance().onClickSubmit();

        expect(conversationActions.updateIntentWithConversations).toHaveBeenCalled();
        expect(props.dispatch).toHaveBeenCalledWith('action updateIntentWithConversations');
      });
    });

    describe('onClickCancel', () => {
      test('should dispatch action to cancel AddToConversations', () => {
        wrapper.instance().onClickCancel();
        expect(props.onClickClose).toHaveBeenCalled();
      });
    });

    describe('getAllIntents', () => {
      test('should get all intents - empty list', () => {
        expect(wrapper.instance().getAllIntents()).toMatchSnapshot();
      });
    });
  });
});
