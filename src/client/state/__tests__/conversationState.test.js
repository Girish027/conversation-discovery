import * as conversationState from 'state/conversationsState';
import * as clusterState from 'state/clusterState';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import api from 'utils/api';
import * as GlobalTypes from 'state/types';
import {
  fromJS, List
} from 'immutable';
import PreviewManager from '../../utils/PreviewManager';

jest.mock('utils/api');

const {
  conversationReducer,
  types,
  stateKey
} = conversationState;

const {
  UPDATE_CAA, SELECT_ACTIVE_PROJECT, SELECT_RUN, SELECT_CLUSTER
} = GlobalTypes;

describe('state/conversations:', function () {
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
  }];

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
  }, {
    transcriptId: 'abc-abc',
    sentenceSet: `hello. I placed an order with Garbanzo Mediterranean and the driver called me to inform me that they closed early because of NYE. I tried to
cancel the order in hopes of a refund and was not allowed to. Am I able to receive a refund since I did not get me food . Will this refund become
credits or back into my account`,
    originalSimilarity: 0.67,
    originalCluster: 'original-cluster-Id', // all these will be same as there is no curation
    previousCluster: 'previous-cluster-id',
    currentCluster: 'current-cluster-id',
    modifiedBy: 'user1@247.ai',
    modified: 1554930400000,
  }];

  const transcriptId = 'qwe-qwe';

  const conversationsAddingInProgress = false;

  const conversationTranscript = [{
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

  const transcript = {
    transcriptId: 'selected transcript id from response',
    turns: [{
      turnSequence: 1,
      from: 0, // 0 - Agent, 1 - Visitor
      message: 'How can we help?'
    }, {
      turnSequence: 2,
      from: 1, // 0 - Agent, 1 - Visitor
      message: 'I need to cancel my order'
    }]
  };

  const caa = {
    clientId: '247ai',
    appId: 'referencebot',
    accountId: 'referencebot'
  };

  describe('Conversation Actions:', function () {
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
          selectedClusterId: '2',
        },
        conversations: {
          selectedTranscriptId: 'qwe-qwe',
          conversations: fromJS(conversations),
          transcript: {},
        }
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('onGetFail:', () => {
      test('should dispatch action to indicate run creation has failed', () => {
        const error = {
          err: 'server error',
          message: 'some error occurred'
        };
        store.dispatch(conversationState.onGetFail(error));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch action to indicate run creation has failed empty error', () => {
        store.dispatch(conversationState.onGetFail());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onGetFailIntent:', () => {
      test('should dispatch action to indicate run creation has failed', () => {
        const error = {
          err: 'server error',
          message: 'some error occurred'
        };
        store.dispatch(conversationState.onGetFailIntent(error));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch action to indicate run creation has failed empty error', () => {
        store.dispatch(conversationState.onGetFailIntent());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onGetFailFaq:', () => {
      test('should dispatch action to indicate run creation has failed', () => {
        const error = {
          err: 'server error',
          message: 'some error occurred'
        };
        store.dispatch(conversationState.onGetFailFaq(error));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch action to indicate run creation has failed empty error', () => {
        store.dispatch(conversationState.onGetFailFaq());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('receiveAllConversations:', () => {
      test('should dispatch action to indicate all conversations are recieved', () => {
        store.dispatch(conversationState.receiveAllConversations(conversations));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getAllConversations:', () => {
      test('should make a get call with the correct url and data', () => {
        store.dispatch(conversationState.getAllConversations());
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: conversationState.receiveAllConversations,
          onApiError: conversationState.onGetFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });

      test('should make a get call with the correct url and data - Case 1', () => {
        const searchItem = {
          search: conversations[0].sentenceSet, similarity: '0.8'
        };
        store.dispatch(conversationState.getAllConversations(searchItem));
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: conversationState.receiveAllConversations,
          onApiError: conversationState.onGetFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });

      test('should make a get call with the correct url and data - Case 2', () => {
        const searchItem = {
          similarity: '0.8'
        };
        store.dispatch(conversationState.getAllConversations(searchItem));
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: conversationState.receiveAllConversations,
          onApiError: conversationState.onGetFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });

      test('should make a get call with the correct url and data - Case 3', () => {
        const searchItem = {
          search: conversations[0].sentenceSet
        };
        store.dispatch(conversationState.getAllConversations(searchItem));
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: conversationState.receiveAllConversations,
          onApiError: conversationState.onGetFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('receiveConversationTranscript:', () => {
      test('should dispatch action to indicate all conversations of Transcript Id are recieved', () => {
        store.dispatch(conversationState.receiveConversationTranscript(conversationTranscript));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('receiveConversationTranscriptApiSuccess:', () => {
      beforeAll(() => {
        PreviewManager.getWidgetState = jest.fn(() => true);
        PreviewManager.autoCloseWidget = jest.fn(() => 'autoCloseWidget');
      });
      
      test('should dispatch action to indicate all conversations of Transcript Id are recieved successfully', () => {
        store.dispatch(conversationState.receiveConversationTranscriptApiSuccess(conversationTranscript));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch action to indicate 0 conversations of Transcript Id are recieved successfully', () => {
        store.dispatch(conversationState.receiveConversationTranscriptApiSuccess());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getConversationTranscript:', () => {
      test('should make a get call with the correct url and data', () => {
        store.dispatch(conversationState.getConversationTranscript(transcriptId));
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: conversationState.receiveConversationTranscriptApiSuccess,
          onApiError: conversationState.onGetFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('receiveTranscript:', () => {
      test('should dispatch recieve transcript', () => {
        store.dispatch(conversationState.receiveTranscript(transcript));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch recieve empty transcript', () => {
        store.dispatch(conversationState.receiveTranscript());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getTranscript:', () => {
      test('should make a get call with the correct url and data', () => {
        store.dispatch(conversationState.getTranscript());
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: conversationState.receiveTranscript,
          onApiError: conversationState.onGetFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('getIntents:', () => {
      test('should make a get call with the correct url and data', () => {
        store.dispatch(conversationState.getIntents());
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: conversationState.receiveIntents,
          onApiError: conversationState.onGetFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('getInterfaces:', () => {
      test('should make a get call with the correct url and data', () => {
        store.dispatch(conversationState.getInterfaces());
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: conversationState.receiveInterfaces,
          onApiError: conversationState.onGetFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('getFAQs:', () => {
      test('should make a get call with the correct url and data', () => {
        const interfaceId = '1';
        store.dispatch(conversationState.getFAQs(interfaceId));
        expect(api.get).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          onApiSuccess: conversationState.receiveFaqs,
          onApiError: conversationState.onGetFail,
        });
        expect(api.get.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('createIntentWithConversations:', () => {
      test('should make a post call with the correct url and data', () => {
        const payload = {
          utterances: conversations, responses: {}, nodeName: 'nodeName', nodeId: 'node-1'
        };
        store.dispatch(conversationState.createIntentWithConversations(payload, conversations));
        expect(api.post).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          data: expect.any(Object),
          onApiSuccess: conversationState.onAddToBotSuccessCreateIntent,
          onApiError: expect.any(Function),
        });
        expect(api.post.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('updateIntentWithConversations:', () => {
      test('should make a patch call with the correct url and data', () => {
        const payload = {
          utterances: conversations, responses: {}, nodeName: 'nodeName', nodeId: 'node-1'
        };
        store.dispatch(conversationState.updateIntentWithConversations(payload));
        expect(api.patch).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          data: expect.any(Object),
          onApiSuccess: conversationState.onAddToBotSuccessUpdateIntent,
          onApiError: expect.any(Function),
        });
        expect(api.patch.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('onAddToBotSuccessCreateIntent:', () => {
      
      test('should dispatch action to onAddToBotSuccessCreateIntent', () => {
        let res = { 
          nodeId: 'node-1', 
          nodeName: 'nodeName-1' 
        };
        store.dispatch(conversationState.onAddToBotSuccessCreateIntent(res));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onAddToBotSuccessUpdateIntent:', () => {
      
      test('should dispatch action to  onAddToBotSuccessUpdateIntent', () => {
        let res = { 
          nodeId: 'node-1', 
          nodeName: 'nodeName-1' 
        };
        store.dispatch(conversationState.onAddToBotSuccessUpdateIntent(res));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onAddToBotSuccess:', () => {
      
      test('should dispatch action to  onAddToBotSuccess', () => {
        let res = { 
          nodeId: 'node-1', 
          nodeName: 'nodeName-1' 
        };
        store.dispatch(conversationState.onAddToBotSuccess(res));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('createFaqWithAnswers:', () => {
      test('should make a post call with the correct url and data', () => {
        const payload = {
          utterances: conversations, responses: {}, nodeName: 'nodeName', nodeId: 'node-1'
        };
        const interfaceId = '1';
        store.dispatch(conversationState.createFaqWithAnswers(interfaceId, payload, conversations));
        expect(api.post).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          data: expect.any(Object),
          onApiSuccess: conversationState.onAddToFaqSuccessCreateFaq,
          onApiError: expect.any(Function),
        });
        expect(api.post.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('updateFaqWithAnswers:', () => {
      test('should make a patch call with the correct url and data', () => {
        const payload = {
          utterances: conversations, responses: {}, nodeName: 'nodeName', nodeId: 'node-1'
        };
        const interfaceId = '1';
        store.dispatch(conversationState.updateFaqWithAnswers(interfaceId, payload));
        expect(api.patch).toHaveBeenCalledWith({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          url: expect.any(String),
          data: expect.any(Object),
          onApiSuccess: conversationState.onAddToFaqSuccessUpdateFaq,
          onApiError: expect.any(Function),
        });
        expect(api.patch.mock.calls[0][0].url).toMatchSnapshot();
      });
    });

    describe('onAddToFaqSuccessCreateFaq:', () => {
      
      test('should dispatch action to onAddToFaqSuccessCreateFaq', () => {
        let res = { 
          responseId: 'response-1', 
          title: 'responedTitle' 
        };
        store.dispatch(conversationState.onAddToFaqSuccessCreateFaq(res));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onAddToFaqSuccessUpdateFaq:', () => {
      
      test('should dispatch action to  onAddToFaqSuccessUpdateFaq', () => {
        let res = { 
          responseId: 'response-1', 
          title: 'responedTitle' 
        };
        store.dispatch(conversationState.onAddToFaqSuccessUpdateFaq(res));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('onAddToFaqSuccess:', () => {
      
      test('should dispatch action to  onAddToFaqSuccess', () => {
        let res = { 
          responseId: 'response-1', 
          title: 'responedTitle' 
        };
        store.dispatch(conversationState.onAddToFaqSuccess(res));
        expect(store.getActions()).toMatchSnapshot();
      });
    });



    describe('setSelectedTranscript:', () => {
      test('should dispatch set a selected transcript', () => {
        store.dispatch(conversationState.setSelectedTranscript(transcript.transcriptId));
        expect(store.getActions()).toMatchSnapshot();
      });
    });


    describe('viewTranscript:', () => {
      beforeAll(() => {
        conversationState.setSelectedTranscript = jest.fn(() => 'setSelectedTranscript');
      });
      test('should dispatch  actions for viewing transcript', () => {
        store.dispatch(conversationState.receiveTranscript(transcript.transcriptId));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('closeTranscript:', () => {
      test('should dispatch  actions for closing transcript', () => {
        store.dispatch(conversationState.closeTranscript());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('receiveIntents:', () => {
      test('should dispatch  actions for receiveIntents', () => {
        let intents = {};
        store.dispatch(conversationState.receiveIntents(intents));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch  actions for empty receiveIntents', () => {
        store.dispatch(conversationState.receiveIntents());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('receiveInterfaces:', () => {
      test('should dispatch  actions for receiveInterfaces', () => {
        let interfaces = {};
        store.dispatch(conversationState.receiveInterfaces(interfaces));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch  actions for empty receiveInterfaces', () => {
        store.dispatch(conversationState.receiveInterfaces());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('receiveFaqs:', () => {
      test('should dispatch  actions for receiveFaqs', () => {
        let faqs = {};
        store.dispatch(conversationState.receiveFaqs(faqs));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch  actions for empty receiveFaqs', () => {
        store.dispatch(conversationState.receiveFaqs());
        expect(store.getActions()).toMatchSnapshot();
      });
    });
  });

  describe('Conversation Reducers: ', function () {
    test('should return the initial state', () => {
      const newState = conversationReducer(undefined, {
        type: types.NOOP,
      });
      expect(newState).toEqual(conversationState.initialConversationsState);
    });

    test('CLEAR_ALL_CONVERSATIONS', () => {
      const currentState = fromJS({
        conversations: List(fromJS([{ transcriptId: 'ABC-ABC' }])),
        selectedTranscriptId: 'ABC-ABC',
        transcript,
      });
      const newState = conversationReducer(currentState, {
        type: types.CLEAR_ALL_CONVERSATIONS
      });
      expect(newState).toEqual(conversationState.initialConversationsState);
    });

    describe('RECEIVE_ALL_CONVERSATIONS:', function () {
      test('should update conversations list', () => {
        const convList = [{ transcriptId: 'ABC-ABC' }];
        const newState = conversationReducer(undefined, {
          type: types.RECEIVE_ALL_CONVERSATIONS,
          conversationsList: convList
        });
        expect(newState.get(stateKey.conversations).toJS()).toEqual(convList);
      });
    });

    describe('RECEIVE_TRANSCRIPT:', function () {
      test('should update transcript details', () => {
        const newState = conversationReducer(undefined, {
          type: types.RECEIVE_TRANSCRIPT,
          transcript,
        });
        expect(newState.get(stateKey.transcript).toJS()).toEqual(transcript);
      });
    });

    describe('RECEIVE_INTENTS:', function () {
      test('should update Intent details', () => {
        const intents = {};
        const newState = conversationReducer(undefined, {
          type: types.RECEIVE_INTENTS,
          intents,
        });
        expect(newState.get(stateKey.intents).toJS()).toEqual(intents);
      });
    });

    describe('RECEIVE_INTERFACES:', function () {
      test('should update Interfaces details', () => {
        const interfaces = {};
        const newState = conversationReducer(undefined, {
          type: types.RECEIVE_INTERFACES,
          interfaces,
        });
        expect(newState.get(stateKey.interfaces).toJS()).toEqual(interfaces);
      });
    });

    describe('RECEIVE_FAQS:', function () {
      test('should update Interfaces details', () => {
        const faqs = {};
        const newState = conversationReducer(undefined, {
          type: types.RECEIVE_FAQS,
          faqs,
        });
        expect(newState.get(stateKey.faqs).toJS()).toEqual(faqs);
      });
    });

    describe('RECEIVE_CONVERSATION_TRANSCRIPT:', function () {
      beforeEach(() => {
        PreviewManager.getInitDone = jest.fn(() => true);
        PreviewManager.getWidgetState = jest.fn(() => true);
        PreviewManager.synthesizeViewTranscript = jest.fn(() => 'synthesizeViewTranscript');
      });
      test('should update conversations transcript list', () => {
        const convList = [{ transcriptId: 'ABC-ABC' }];
        const newState = conversationReducer(undefined, {
          type: types.RECEIVE_CONVERSATION_TRANSCRIPT,
          conversationsList: convList
        });
        expect(newState.get(stateKey.conversationTranscript).toJS()).toEqual(convList);
      });
    });

    describe('SELECT_TRANSCRIPT:', function () {
      test('should update set transcript Id and clear exisitng transcript detail', () => {
        const newState = conversationReducer(
          fromJS({
            transcript: {
              transcriptId: 'abc-abc'
            }
          }),
          {
            type: types.SELECT_TRANSCRIPT,
            selectedTranscriptId: 'new-transcript-id',
          });
        expect(newState.get(stateKey.selectedTranscriptId)).toEqual('new-transcript-id');
        expect(newState.get(stateKey.transcript).toJS()).toEqual({});
      });
    });

    describe('CLOSE_TRANSCRIPT:', function () {
      test('should clear transcript Id and clear exisitng transcript detail', () => {
        const newState = conversationReducer(
          fromJS({
            transcript: {
              transcriptId: 'abc-abc'
            },
            selectedTranscriptId: 'abc-abc'
          }),
          {
            type: types.CLOSE_TRANSCRIPT,
          });
        expect(newState.get(stateKey.selectedTranscriptId)).toEqual('');
        expect(newState.get(stateKey.transcript).toJS()).toEqual({});
      });
    }); 

    [UPDATE_CAA, SELECT_ACTIVE_PROJECT, SELECT_RUN, SELECT_CLUSTER].forEach((globaltype) => {
      test(globaltype, () => {
        const currentState = fromJS({
          conversations: List(fromJS([{ transcriptId: 'ABC-ABC' }])),
          selectedTranscriptId: 'ABC-ABC',
          trackConversations: false,
          transcript,
          conversationTranscript: List(fromJS([])),
          conversationsAddingInProgress: false,
          loadingFAQs: false,
        });
        const newState = conversationReducer(currentState, {
          type: globaltype
        });
        expect(newState).toEqual(conversationState.initialConversationsState);
      });
    });
  });

  describe('Conversation Selectors:', function () {
    let state;

    beforeAll(() => {
      state = fromJS({
        conversations: fromJS({
          conversations: List(fromJS(conversations)),
          trackConversations: false,
          selectedTranscriptId: 'abc-abc',
          transcript,
          conversationTranscript: List(fromJS(conversationTranscript)),
          conversationsAddingInProgress: false,
        })
      });
    });

    test('getConversationsState', function () {
      expect(conversationState.getConversationsState(state)).toEqual(state.get('conversations'));
    });

    test('getSelectedTranscriptId', function () {
      expect(conversationState.getSelectedTranscriptId(state)).toEqual('abc-abc');
    });

    test('getConversationsToTrackSelector', function () {
      expect(conversationState.getConversationsToTrackSelector(state)).toEqual(false);
    });

    test('getConversationsList', function () {
      expect(conversationState.getConversationsList(state).toJS()).toEqual(conversations);
    });

    test('getSelectedTranscript', function () {
      expect(conversationState.getSelectedTranscript(state).toJS()).toEqual(transcript);
    });
    
    test('getConversationTranscriptSelector', function () {
      expect(conversationState.getConversationTranscriptSelector(state).toJS()).toEqual(conversationTranscript);
    });

    test('getconversationsAddingInProgress', function () {
      expect(conversationState.getconversationsAddingInProgress(state)).toEqual(conversationsAddingInProgress);
    });
  });
});
