import {
  fromJS, List, Map
} from 'immutable';
import { createSelector } from 'reselect';
import api from '../utils/api';
import Constants from '../constants';
import Language from '../Language';
import { getCAASelector, setModalIsOpen } from 'state/appState';
import { getActiveProjectId } from 'state/projectsState';
import { getSelectedRunId } from 'state/runsState';
import { getSelectedClusterId, clusterActions } from 'state/clusterState';
import { headerActions } from './headerState';
import { logAmplitudeEvent } from '../utils/amplitudeUtils';
import {
  UPDATE_CAA,
  SELECT_ACTIVE_PROJECT,
  SELECT_RUN,
  SELECT_CLUSTER,
} from './types';
import PreviewManager from '../utils/PreviewManager';
import ObjectUtils from '../utils/ObjectUtils';

export const types = {
  CLEAR_ALL_CONVERSATIONS: 'CLEAR_ALL_CONVERSATIONS',

  RECEIVE_ALL_CONVERSATIONS: 'conversations/RECEIVE_ALL_CONVERSATIONS',
  RECEIVE_CONVERSATION_TRANSCRIPT: 'conversations/RECEIVE_CONVERSATION_TRANSCRIPT',
  ADD_CONVERSATIONS_START: 'conversations/ADD_CONVERSATIONS_START',
  ADD_CONVERSATIONS_FAIL: 'conversations/ADD_CONVERSATIONS_FAIL',
  SET_SELECTED_CONVERSATIONS: 'conversations/SET_SELECTED_CONVERSATIONS',
  SET_CONVERSATIONS: 'conversations/SET_CONVERSATIONS',
  ADD_CONVERSATIONS_SUCCESS: 'ADD_CONVERSATIONS_SUCCESS',
  ADD_CONVERSATIONS_COMPLETE: 'conversations/ADD_CONVERSATIONS_COMPLETE',
  RECEIVE_TRANSCRIPT: 'conversations/RECEIVE_TRANSCRIPT',
  SELECT_TRANSCRIPT: 'conversations/SELECT_TRANSCRIPT',
  CLOSE_TRANSCRIPT: 'conversations/CLOSE_TRANSCRIPT',
  RECEIVE_INTENTS: 'conversations/RECEIVE_INTENTS',
  RECEIVE_INTERFACES: 'conversations/RECEIVE_INTERFACES',
  RECEIVE_FAQS: 'conversations/RECEIVE_FAQS',
  LOADING_FAQS: 'conversations/LOADING_FAQS',
  SET_CONVERSATION_COUNT: 'conversations/SET_CONVERSATION_COUNT'
};

export const stateKey = {
  conversations: 'conversations',
  selectedTranscriptId: 'selectedTranscriptId',
  trackConversations: 'trackConversations',
  transcript: 'transcript',
  intents: 'intents',
  interfaces: 'interfaces',
  faqs: 'faqs',
  searchedConversation: 'searchedConversation',
  conversationTranscript: 'conversationTranscript',
  conversationsAddingInProgress: 'conversationsAddingInProgress',
  conversationCount: 'conversationCount',
  selectedConversations: 'selectedConversations',
  loadingFAQs: 'loadingFAQs',
};
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const addConversationsStart = (conversations) => ({
  type: types.ADD_CONVERSATIONS_START,
  conversations,
});

export const setSelectedConversations = (conversations) => ({
  type: types.SET_SELECTED_CONVERSATIONS,
  conversations,
});

export const setDefaultConversations = () => ({
  type: types.SET_CONVERSATIONS,
});

export const addConversationsFail = (error) => ({
  type: types.ADD_CONVERSATIONS_FAIL,
  error,
});

export const addConversationsSuccess = (conversations) => ({
  type: types.ADD_CONVERSATIONS_SUCCESS,
  conversations,
});

export const addConversationsComplete = (isComplete = true) => ({
  type: types.ADD_CONVERSATIONS_COMPLETE,
  isComplete
});

export const setLoadingFAQs = (loadingFAQs = false) => ({
  type: types.LOADING_FAQS,
  loadingFAQs
});

export const onAddToBotSuccess = (response, mode) => (dispatch, getState) => {
  const data = getURLData(getState());
  sleep(2000).then(() => {
    const IDTAddToBotEvent = {
      toolId: Constants.toolName
    };
    logAmplitudeEvent('IDTAddToBotEvent', IDTAddToBotEvent);
    dispatch(setModalIsOpen(false));
    dispatch(addConversationsComplete(true));
    if (mode === 'create') {
      dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.addedToBotCreate(response.nodeName), Constants.notification.success));
    } else {
      dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.addedToBotUpdate(response.nodeName), Constants.notification.success));
    }
    dispatch(clusterActions.selectCluster(data.clusterId));
    dispatch(conversationActions.getIntents());
  });
};

export const onAddToBotSuccessCreateIntent = (res) => (dispatch) => {
  const { nodeId, nodeName } = res;
  dispatch(addConversationsSuccess(res));
  const IDTCreateIntentEvent = {
    toolId: Constants.toolName, nodeId, nodeName, env: Constants.environment
  };
  logAmplitudeEvent('IDTCreateIntentEvent', IDTCreateIntentEvent);
  dispatch(onAddToBotSuccess(res, 'create'));
};

export const onAddToBotSuccessUpdateIntent = (res) => (dispatch) => {
  const { nodeId, nodeName } = res;
  dispatch(addConversationsSuccess(res));
  const IDTUpdateIntentEvent = {
    toolId: Constants.toolName, nodeId, nodeName, env: Constants.environment
  };
  logAmplitudeEvent('IDTUpdateIntentEvent', IDTUpdateIntentEvent);
  dispatch(onAddToBotSuccess(res, 'update'));
};

export const onAddToFaqSuccess = (response) => (dispatch, getState) => {
  const data = getURLData(getState());
  sleep(2000).then(() => {
    dispatch(setModalIsOpen(false));
    dispatch(addConversationsComplete(true));
    dispatch(headerActions.showNotificationWithTimer(Language.NOTIFICATIONS.addedToFaq(response.title), Constants.notification.success));
    dispatch(clusterActions.selectCluster(data.clusterId));
  });
};

export const onAddToFaqSuccessCreateFaq = (res) => (dispatch) => {
  const { response } = res;
  dispatch(addConversationsSuccess(res));
  dispatch(onAddToFaqSuccess(response));
};

export const onAddToFaqSuccessUpdateFaq = (res) => (dispatch) => {
  const { response } = res;
  dispatch(addConversationsSuccess(res));
  dispatch(onAddToFaqSuccess(response));
};


export const initialConversationsState = fromJS({
  // should contain list of conversations with all its metadata
  // this is a Immutable List that contains Maps
  conversations: List(),
  // id of run currently selected by the user
  selectedTranscriptId: '',
  // When Curation is implemented, this should be set to true.
  trackConversations: false,
  // holds the transcript information of the selected conversation/transcript.
  transcript: {},
  // list of conversations for a transcriptId
  conversationTranscript: List(),
  // conversations adding in progress
  conversationsAddingInProgress: false,
  conversationCount: -1,
  selectedConversations: List(),
  loadingFAQs: false,
});

const getURLData = (state) => {
  const projectId = getActiveProjectId(state);
  const runId = getSelectedRunId(state);
  const caa = getCAASelector(state);
  const clusterId = getSelectedClusterId(state);
  const transcriptId = getSelectedTranscriptId(state);
  return {
    ...caa, projectId, runId, clusterId, transcriptId
  };
};

export const setConversationCount = (conversationCount) => ({
  type: types.SET_CONVERSATION_COUNT,
  conversationCount
});

export const onGetFail = (error = {}) => (dispatch) => {
  setLoadingFAQs(false);
  const { err, message } = error;
  const errorMsg = Language[err] ? Language[err] : message;
  dispatch(headerActions.showNotificationWithTimer(errorMsg, Constants.notification.error));
};

export const onGetFailIntent = (selectedUtteranceDetails, error = {}) => (dispatch) => {
  const { err, message } = error;
  dispatch(addConversationsFail(error));
  let errorMsg = Language[err] ? Language[err] : message;
  if (ObjectUtils.isEmptyOrNull(errorMsg)) {
    errorMsg = Language.ERROR_MESSAGES.internalServerError;
  }
  dispatch(setModalIsOpen(false, { modalName: Constants.modals.addToBot }));
  dispatch(setModalIsOpen(true, {
    modalName: Constants.modals.addToBot,
    data: selectedUtteranceDetails,
    errorType: errorMsg
  }));
};

export const onGetFailFaq = (selectedUtteranceDetails, error = {}) => (dispatch) => {
  const { err, message } = error;
  dispatch(addConversationsFail(error));
  let errorMsg = Language[err] ? Language[err] : message;
  if (ObjectUtils.isEmptyOrNull(errorMsg)) {
    errorMsg = Language.ERROR_MESSAGES.internalServerError;
  }
  dispatch(setModalIsOpen(false, { modalName: Constants.modals.addToFaq }));
  dispatch(setModalIsOpen(true, {
    modalName: Constants.modals.addToFaq,
    data: selectedUtteranceDetails,
    errorType: errorMsg
  }));
};

export const receiveAllConversations = (conversationsList = []) => ({
  type: types.RECEIVE_ALL_CONVERSATIONS,
  conversationsList
});

export const getAllConversations = (searchedItem) => (dispatch, getState) => {
  const data = getURLData(getState());
  let url = Constants.serverApiUrls.conversations(data);
  if (searchedItem && Object.prototype.hasOwnProperty.call(searchedItem, 'similarity') && Object.prototype.hasOwnProperty.call(searchedItem, 'search') && searchedItem.similarity !== '') {
    url += `?search=${encodeURIComponent(searchedItem.search.trim())}&similarity=${searchedItem.similarity}`;
  } else if (searchedItem && Object.prototype.hasOwnProperty.call(searchedItem, 'similarity') && searchedItem.similarity !== '') {
    url += `?similarity=${searchedItem.similarity}`;
  } else if (searchedItem && Object.prototype.hasOwnProperty.call(searchedItem, 'search') && searchedItem.search !== '') {
    url += `?search=${encodeURIComponent(searchedItem.search.trim())}`;
  }
  api.get({
    dispatch,
    getState,
    url,
    onApiSuccess: receiveAllConversations,
    onApiError: onGetFail,
  });
};

export const receiveConversationTranscript = (conversationsList = []) => ({
  type: types.RECEIVE_CONVERSATION_TRANSCRIPT,
  conversationsList
});

export const receiveConversationTranscriptApiSuccess = (conversationsList = []) => (dispatch) => {
  if (conversationsList.length === 0) {
    dispatch(headerActions.showNotificationWithTimer(' Unable to fetch Transcript ! ', Constants.notification.error));
    if (PreviewManager.getWidgetState() === true) {
      PreviewManager.autoCloseWidget();
    }
  } else {
    dispatch(receiveConversationTranscript(conversationsList));
  }
};

export const getConversationTranscript = (transcriptId) => (dispatch, getState) => {
  const data = getURLData(getState());
  const url = Constants.serverApiUrls.conversationTranscript(data, transcriptId);
  api.get({
    dispatch,
    getState,
    url,
    onApiSuccess: receiveConversationTranscriptApiSuccess,
    onApiError: onGetFail,
  });
};

export const updateIntentWithConversations = (payload, selectedUtteranceDetails) => (dispatch, getState) => {
  const stateData = getURLData(getState());
  const url = Constants.serverApiUrls.intents(stateData);
  dispatch(addConversationsStart(payload));
  dispatch(setSelectedConversations(payload));
  api.patch({
    dispatch,
    getState,
    url,
    data: payload,
    onApiSuccess: onAddToBotSuccessUpdateIntent,
    onApiError: (error) => onGetFailIntent(selectedUtteranceDetails, error),
  });
};


export const createIntentWithConversations = (payload, selectedUtteranceDetails) => (dispatch, getState) => {
  const stateData = getURLData(getState());
  const url = Constants.serverApiUrls.intents(stateData);
  dispatch(addConversationsStart(payload));
  dispatch(setSelectedConversations(payload));
  api.post({
    dispatch,
    getState,
    url,
    data: payload,
    onApiSuccess: onAddToBotSuccessCreateIntent,
    onApiError: (error) => onGetFailIntent(selectedUtteranceDetails, error),
  });
};

export const createFaqWithAnswers = (interfaceId, payload, selectedUtteranceDetails) => (dispatch, getState) => {
  const stateData = getURLData(getState());
  const url = Constants.serverApiUrls.faqs(stateData, interfaceId);
  dispatch(addConversationsStart(payload));
  dispatch(setSelectedConversations(payload));
  api.post({
    dispatch,
    getState,
    url,
    data: payload,
    onApiSuccess: onAddToFaqSuccessCreateFaq,
    onApiError: (error) => onGetFailFaq(selectedUtteranceDetails, error),
  });
};

export const updateFaqWithAnswers = (interfaceId, payload, selectedUtteranceDetails) => (dispatch, getState) => {
  const stateData = getURLData(getState());
  const url = Constants.serverApiUrls.faqs(stateData, interfaceId);
  dispatch(addConversationsStart(payload));
  dispatch(setSelectedConversations(payload));
  api.patch({
    dispatch,
    getState,
    url,
    data: payload,
    onApiSuccess: onAddToFaqSuccessUpdateFaq,
    onApiError: (error) => onGetFailFaq(selectedUtteranceDetails, error),
  });
};

export const receiveTranscript = (transcript = {}) => ({
  type: types.RECEIVE_TRANSCRIPT,
  transcript
});

export const getTranscript = () => (dispatch, getState) => {
  const data = getURLData(getState());
  const url = Constants.serverApiUrls.transcript(data);
  api.get({
    dispatch,
    getState,
    url,
    onApiSuccess: receiveTranscript,
    onApiError: onGetFail,
  });
};

export const receiveIntents = (intents = {}) => ({
  type: types.RECEIVE_INTENTS,
  intents
});

export const receiveInterfaces = (interfaces = {}) => ({
  type: types.RECEIVE_INTERFACES,
  interfaces
});

export const receiveFaqs = (faqs = {}) => ({
  type: types.RECEIVE_FAQS,
  faqs
});

export const getIntents = () => (dispatch, getState) => {
  const data = getURLData(getState());
  const url = Constants.serverApiUrls.intents(data);
  api.get({
    dispatch,
    getState,
    url,
    onApiSuccess: receiveIntents,
    onApiError: onGetFail,
  });
};

export const getInterfaces = () => (dispatch, getState) => {
  const data = getURLData(getState());
  const url = Constants.serverApiUrls.interfaces(data);
  api.get({
    dispatch,
    getState,
    url,
    onApiSuccess: receiveInterfaces,
    onApiError: onGetFail,
  });
};

export const getFAQs = (interfaceId) => (dispatch, getState) => {
  const data = getURLData(getState());
  const url = Constants.serverApiUrls.faqs(data, interfaceId);
  api.get({
    dispatch,
    getState,
    url,
    onApiSuccess: receiveFaqs,
    onApiError: onGetFail,
  });
};

export const setSelectedTranscript = (selectedTranscriptId) => ({
  type: types.SELECT_TRANSCRIPT,
  selectedTranscriptId
});

export const viewTranscript = (transcriptId) => (dispatch) => {
  dispatch(setSelectedTranscript(transcriptId));
  dispatch(getTranscript());
};

export const closeTranscript = () => ({
  type: types.CLOSE_TRANSCRIPT,
});

// REDUCERS
export const conversationReducer = (state = initialConversationsState, action) => {
  switch (action.type) {
    case types.CLEAR_ALL_CONVERSATIONS: return initialConversationsState;

    case types.ADD_CONVERSATIONS_START:
      return state.set(stateKey.conversationsAddingInProgress, true);

    case types.SET_SELECTED_CONVERSATIONS: {
      const { conversations } = action;
      return state.set(stateKey.selectedConversations, conversations);
    }
    case types.SET_CONVERSATIONS: {
      return state.set(stateKey.selectedConversations, undefined);
    }
    case types.ADD_CONVERSATIONS_FAIL:
      return state.set(stateKey.conversationsAddingInProgress, false);

    case types.ADD_CONVERSATIONS_COMPLETE: {
      const { isComplete } = action;
      return state.set(stateKey.conversationsAddingInProgress, !isComplete);
    }

    case types.LOADING_FAQS: {
      const { loadingFAQs } = action;
      return state.set(stateKey.loadingFAQs, loadingFAQs);
    }

    case types.RECEIVE_ALL_CONVERSATIONS: {
      const { conversationsList } = action;
      return state.set(stateKey.conversations, fromJS(conversationsList))
        .set(stateKey.conversationCount, conversationsList.length);
    }

    case types.RECEIVE_CONVERSATION_TRANSCRIPT: {
      const { conversationsList } = action;
      if (conversationsList.length !== 0) {
        if (PreviewManager.getInitDone() === false) {
          PreviewManager.loadWidget(() => {
            PreviewManager.synthesizeViewTranscript(conversationsList);
          });
        } else if (PreviewManager.getWidgetState()) {
          PreviewManager.synthesizeViewTranscript(conversationsList);
        } else {
          PreviewManager.reloadWidget(() => {
            PreviewManager.synthesizeViewTranscript(conversationsList);
          });
        }
      }
      return state.set(stateKey.conversationTranscript, fromJS(conversationsList));
    }

    case types.RECEIVE_TRANSCRIPT: {
      const { transcript } = action;
      return state.set(stateKey.transcript, fromJS(transcript));
    }

    case types.SELECT_TRANSCRIPT: {
      return state
        .set(stateKey.selectedTranscriptId, action.selectedTranscriptId)
        .set(stateKey.transcript, Map());
    }

    case types.CLOSE_TRANSCRIPT: {
      return state
        .set(stateKey.selectedTranscriptId, '')
        .set(stateKey.transcript, Map());
    }

    case types.RECEIVE_INTENTS: {
      const { intents } = action;
      return state.set(stateKey.intents, fromJS(intents));
    }

    case types.RECEIVE_INTERFACES: {
      const { interfaces } = action;
      return state.set(stateKey.interfaces, fromJS(interfaces));
    }

    case types.RECEIVE_FAQS: {
      const { faqs } = action;
      return state.set(stateKey.faqs, fromJS(faqs))
        .set(stateKey.loadingFAQs, false);
    }
    // The below reducers are handling part of the global state change
    case UPDATE_CAA:
    case SELECT_ACTIVE_PROJECT:
    case SELECT_RUN:
    case SELECT_CLUSTER:
      // clear conversations state when any of the above change
      // don't set to initial state as intents will also get cleared.
      return state
        .set(stateKey.conversations, fromJS(List()))
        .set(stateKey.selectedTranscriptId, fromJS(''))
        .set(stateKey.trackConversations, fromJS(false))
        .set(stateKey.transcript, fromJS({}))
        .set(stateKey.conversationCount, -1)
        .set(stateKey.selectedConversations, fromJS(List()));
    default:
      return state;
  }
};

// SELECTORS
export const getConversationsState = (state) => state.get('conversations');

export const getSelectedTranscriptId = (state) => getConversationsState(state).getIn([stateKey.selectedTranscriptId]);

export const getconversationsAddingInProgress = (state) => getConversationsState(state).getIn([stateKey.conversationsAddingInProgress]);

export const getConversationsToTrackSelector = (state) => getConversationsState(state).getIn([stateKey.trackConversations]);

export const getConversationsList = createSelector(
  getConversationsState,
  (conversationsState) => conversationsState.get(stateKey.conversations),
);

export const getSelectedTranscript = createSelector(
  getConversationsState,
  (conversationsState) => conversationsState.get(stateKey.transcript),
);

export const getIntentsList = createSelector(
  getConversationsState,
  (conversationsState) => conversationsState.get(stateKey.intents),
);

export const getInterfacesList = createSelector(
  getConversationsState,
  (conversationsState) => conversationsState.get(stateKey.interfaces),
);

export const getFaqsList = createSelector(
  getConversationsState,
  (conversationsState) => conversationsState.get(stateKey.faqs),
);

export const getLoadingFAQs = createSelector(
  getConversationsState,
  (conversationsState) => conversationsState.get(stateKey.loadingFAQs),
);

export const getConversationTranscriptSelector = createSelector(
  getConversationsState,
  (conversationsState) => conversationsState.get(stateKey.conversationTranscript),
);

export const getSelectedConversations = createSelector(
  getConversationsState,
  (conversationsState) => conversationsState.get(stateKey.selectedConversations),
);

export const getConversationCount = (state) => getConversationsState(state).getIn([stateKey.conversationCount]);

// SELECTORS TO BE USED IN COMPONENTS
export const conversationSelectors = {
  getConversationsList,
  getSelectedTranscriptId,
  getSelectedTranscript,
  getConversationsToTrackSelector,
  getconversationsAddingInProgress,
  getIntentsList,
  getInterfacesList,
  getFaqsList,
  getLoadingFAQs,
  getConversationTranscriptSelector,
  getConversationCount,
  getSelectedConversations,
};

// ACTIONS TO BE DISPATCHED FROM COMPONENTS
export const conversationActions = {
  getAllConversations,
  viewTranscript,
  closeTranscript,
  getIntents,
  getInterfaces,
  getFAQs,
  updateIntentWithConversations,
  createIntentWithConversations,
  getConversationTranscript,
  setConversationCount,
  createFaqWithAnswers,
  updateFaqWithAnswers,
  setLoadingFAQs
};
