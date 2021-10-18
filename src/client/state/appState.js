import {
  fromJS, List, Map
} from 'immutable';
import { createSelector } from 'reselect';
import axios from 'axios';
import _ from 'lodash';
import { push } from 'connected-react-router';
import { getURLParams } from 'utils/URIUtils';
import { routeNames, getRoute } from 'utils/RouteHelper';
import { getPathnameSelector } from 'state/routerState';
import appLogger from 'utils/appLogger';
import { LOCATION_CHANGE, UPDATE_CAA } from 'state/types';
import { getAllProjects } from 'state/projectsState';
import { setDefaultsForAPI } from 'utils/api';
import { isUserAuthorized, getSortedClientsList } from 'utils/caaHelper';
import constants from '../constants';
import { clearStorage, loadStorage, saveStorage } from '../utils/storageManager';
import { logAmplitudeEvent } from '../utils/amplitudeUtils';
import { roles, updateRoleConfig } from '../utils/roleHelper';

export const types = {
  SET_USER_CONFIG: 'app/SET_USER_CONFIG',
  SET_CLIENTS_CONFIG: 'app/SET_CLIENTS_CONFIG',
  MODAL_IS_OPEN: 'app/MODAL_IS_OPEN',
  MODAL_MESSAGE: 'app/MODAL_MESSAGE',
  INIT_ANALYTICS: 'app/INIT_ANALYTICS',
  SET_UNIFIED_PORTAL_CLIENT_PICKER: 'app/SET_UNIFIED_PORTAL_CLIENT_PICKER',
  SHOW_WORD_CLOUD: 'app/SHOW_WORD_CLOUD',
};

export const stateKey = {
  authEnabled: 'authEnabled',
  clientId: 'clientId',
  componentClientId: 'componentClientId',
  appId: 'appId',
  accountId: 'accountId',
  userName: 'userName',
  userType: 'userType',
  itsBaseUrl: 'itsBaseUrl',
  analyticsKey: 'analyticsKey',
  clientConfigs: 'clientConfigs',
  modalIsOpen: 'modalIsOpen',
  modalMessage: 'modalMessage',
  modalState: 'modalState',
  unifiedPortalClientPicker: 'unifiedPortalClientPicker',
  docPortalUrl: 'docPortalUrl',
  unifiedPortalUrl: 'unifiedPortalUrl',
  contactSupportUrl: 'contactSupportUrl',
  oktaUserAccountUrl: 'oktaUserAccountUrl',
  isAnswers: 'isAnswers',
  isConversations: 'isConversations',
  userRole: 'userRole',
  roleConfig: 'roleConfig',
  showWordCloud: 'showWordCloud',
  wordCloudcontent: 'wordCloudcontent',
};

export const initialAppState = fromJS({
  authEnabled: false,
  clientId: '',
  componentClientId: '',
  appId: '',
  accountId: '',
  userName: '',
  userType: '',
  itsBaseUrl: '',
  analyticsKey: '',
  clientConfigs: List(),
  modalIsOpen: false,
  modalMessage: '',
  modalState: {},
  unifiedPortalClientPicker: false,
  docPortalUrl: '',
  unifiedPortalUrl: '',
  contactSupportUrl: '',
  oktaUserAccountUrl: '',
  isConversations: false,
  isAnswers: false,
  userRole: '',
  roleConfig: {},
  showWordCloud: false,
  wordCloudcontent: '',
});

const devlog = appLogger({ tag: 'appState' });

export const updateCAA = (caa) => ({
  type: UPDATE_CAA,
  caa,
});

export const setUnifiedPortalClientPicker = (unifiedPortalClientPicker) => ({
  type: types.SET_UNIFIED_PORTAL_CLIENT_PICKER,
  unifiedPortalClientPicker
});

export const setUserConfig = (config) => ({
  type: types.SET_USER_CONFIG,
  config,
});

export const setClientsConfig = (clientConfigs = []) => ({
  type: types.SET_CLIENTS_CONFIG,
  clientConfigs,
});

export const setShowWordCloud = (showWordCloud = false, wordCloudcontent = '') => ({
  type: types.SHOW_WORD_CLOUD,
  showWordCloud,
  wordCloudcontent,
});

export const setModalIsOpen = (modalIsOpen, modalState = {}) => ({
  type: types.MODAL_IS_OPEN,
  modalIsOpen,
  modalState,
});

export const setModalMessageState = (modalMessage) => ({
  type: types.MODAL_MESSAGE,
  modalMessage
});

export const setModalMessage = (modalMessage) => (dispatch) => {
  dispatch(setModalMessageState(modalMessage));
};

export const getConversationsConfig = () => (dispatch, getState) => {
  axios.get(constants.serverApiUrls.conversationsConfigUrl, { withCredentials: true })
    .then((configRes) => {
      const { data: configBody = {} } = configRes;
      const conversationsClientConfigs = configBody.clientConfigs;
      let clientConfigs = getClientConfigsSelector(getState());
      clientConfigs = clientConfigs.map((element) => {
        let configObj = element;
        const { clientId } = element;
        const conversationsClient = conversationsClientConfigs.find((config) => config.clientId === clientId);
        if (conversationsClient !== undefined) {
          configObj = { ...configObj, isConversations: true };
        }
        return configObj;
      });
      dispatch(setClientsConfig(clientConfigs));
    })
    .catch((configErr) => {
      devlog.error(configErr);
    });
};

export const getAnswersConfig = () => (dispatch, getState) => {
  axios.get(constants.serverApiUrls.answersConfigUrl, { withCredentials: true })
    .then((configRes) => {
      const { data: configBody = {} } = configRes;
      const answersClientConfigs = configBody.clientConfigs;
      let clientConfigs = getClientConfigsSelector(getState());
      clientConfigs = clientConfigs.map((element) => {
        let configObj = element;
        const { clientId } = element;
        const answersClient = answersClientConfigs.find((config) => config.clientId === clientId);
        if (answersClient !== undefined) {
          configObj = { ...configObj, isAnswers: true };
        }
        return configObj;
      });
      dispatch(setClientsConfig(clientConfigs));
    })
    .catch((configErr) => {
      devlog.error(configErr);
    });
};

export const getUserConfig = () => (dispatch, getState) => {
  axios.get(constants.serverApiUrls.userConfigUrl, { withCredentials: true })
    .then((configRes) => {
      const { data: configBody = {} } = configRes;
      setDefaultsForAPI();

      const sortClientConfigs = getSortedClientsList([...configBody.clientConfigs]);
      dispatch(setClientsConfig(sortClientConfigs));
      dispatch(getAnswersConfig());
      dispatch(getConversationsConfig());
      const userSelectedCAA = getCAASelector(getState());

      const { authorized, clientPicker, caa } = isUserAuthorized(userSelectedCAA, sortClientConfigs);
      if (clientPicker) {
        dispatch(setUnifiedPortalClientPicker(true));
      } else if (!authorized && (userSelectedCAA.clientId !== 'undefined' || userSelectedCAA.appId !== 'undefined')) {
        dispatch(setModalIsOpen(true, {
          modalName: constants.modals.unauthorized,
          header: 'Access Denied',
          message: `You are not authorized to view the client: ${userSelectedCAA.clientId}, app: ${userSelectedCAA.appId} and account: ${userSelectedCAA.accountId}`,
          onClickOk: () => dispatch(closeUnauthorizedModal()),
          onClickClose: () => dispatch(closeUnauthorizedModal()),
          onClickCancel: () => dispatch(closeUnauthorizedModal()),
        }));
      } else {
        dispatch(changeClient(caa));
      }
      dispatch(setUserConfig(configBody));
    })
    .catch((configErr) => {
      devlog.error(configErr);
    });
};

const closeUnauthorizedModal = () => (dispatch) => {
  dispatch(setUnifiedPortalClientPicker(true)); dispatch(setModalIsOpen(false));
};

// When user changes client
export const changeClient = (caa) => (dispatch, getState) => {
  const state = getState();
  const existingCAA = getCAASelector(state);
  if (!_.isEqual(existingCAA, caa)) {
    dispatch(updateCAA(caa));
    clearStorage(constants.activeProjectId);
    clearStorage(constants.isConversations);
    clearStorage(constants.isAnswers);
    clearStorage(constants.userRole);
  }
  const { clientId, appId } = caa;
  const obj = {
    clientId, appId, toolId: constants.toolName, env: constants.environment
  };
  logAmplitudeEvent('IDTClients', obj);
  dispatch(loadRoute(caa));
  dispatch(getAllProjects(caa));
};

const loadRoute = (caa) => (dispatch, getState) => {
  // refresh the page only if it is HOMEPAGE/baseRoute.
  const state = getState();
  const currentPath = getPathnameSelector(state);
  if (currentPath === `${routeNames.HOME_PAGE}/` || currentPath === `${routeNames.BASE_ROUTE}/` || currentPath === `${routeNames.DISCOVER_INTENTS}`) {
    const projectId = loadStorage(constants.activeProjectId, '');
    const newRoute = getRoute(routeNames.DISCOVER_INTENTS, { ...caa, projectId });
    dispatch(push(newRoute));
  }
};

// REDUCERS
export const appReducer = (state = initialAppState, action) => {
  switch (action.type) {
    case types.SET_CLIENTS_CONFIG:
      return state.set(stateKey.clientConfigs, List(action.clientConfigs));
    case types.SET_USER_CONFIG:
      return state.merge(Map({
        userName: action.config.username,
        userType: action.config.userType,
        authEnabled: action.config.authEnabled,
        itsBaseUrl: action.config.itsBaseUrl,
        analyticsKey: action.config.analyticsKey,
        docPortalUrl: action.config.docPortalUrl,
        unifiedPortalUrl: action.config.unifiedPortalUrl,
        contactSupportUrl: action.config.contactSupportUrl,
        oktaUserAccountUrl: action.config.oktaUserAccountUrl,
      }));
    case types.SET_UNIFIED_PORTAL_CLIENT_PICKER:
      return state.set(stateKey.unifiedPortalClientPicker, action.unifiedPortalClientPicker);
    case types.MODAL_IS_OPEN:
      return state.merge(Map({
        modalIsOpen: action.modalIsOpen,
        modalState: action.modalState,
      }));
    case types.MODAL_MESSAGE:
      return state.set(stateKey.modalMessage, action.modalMessage);
    case types.SHOW_WORD_CLOUD:
      return state.merge(Map({
        showWordCloud: action.showWordCloud,
        wordCloudcontent: action.wordCloudcontent,
      }));
    // The below reducers are handling part of the global state change
    case UPDATE_CAA:
      return state.merge(Map(action.caa));
    case LOCATION_CHANGE: {
      const { search } = action.payload.location;
      if (search) {
        const {
          clientid, appid, accountid, componentClientId
        } = getURLParams(search);

        let isAnswers = false;
        let isConversations = false;

        const client = state.get(stateKey.clientId);
        const clientConfigs = state.get(stateKey.clientConfigs);
        const selectedClientConfig = clientConfigs.find((config) => config.clientId === clientid);
        let userRole = roles.unauthorized;
        if (selectedClientConfig) {
          userRole = selectedClientConfig.role;
        }

        if (selectedClientConfig && selectedClientConfig.isAnswers) {
          isAnswers = true;
        }
        if (selectedClientConfig && selectedClientConfig.isConversations) {
          isConversations = true;
        }

        if (client === '') {
          isConversations = loadStorage(constants.isConversations, false);
          isAnswers = loadStorage(constants.isAnswers, false);
          userRole = loadStorage(constants.userRole, roles.unauthorized);
        } else {
          saveStorage(constants.isConversations, isConversations);
          saveStorage(constants.isAnswers, isAnswers);
          saveStorage(constants.userRole, userRole);
        }
        const roleConfig = updateRoleConfig(userRole);
        return state.merge(Map({
          clientId: clientid,
          appId: appid,
          accountId: accountid,
          componentClientId,
          isAnswers,
          isConversations,
          userRole,
          roleConfig,
        }));
      }
      return state;
    }
    default:
      return state;
  }
};

// SELECTORS
export const getAppState = (state) => state.get('app');

export const getCAASelector = createSelector(
  getAppState,
  (appState) => ({
    clientId: appState.get(stateKey.clientId),
    appId: appState.get(stateKey.appId),
    accountId: appState.get(stateKey.accountId),
    componentClientId: appState.get(stateKey.componentClientId),
  })
);

export const getClientIdSelector = createSelector(
  getCAASelector,
  (caa) => caa.clientId
);

export const getComponentClientIdSelector = createSelector(
  getCAASelector,
  (caa) => caa.componentClientId
);

export const getAppIdSelector = createSelector(
  getCAASelector,
  (caa) => caa.appId
);

export const getIsAnswersSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.isAnswers)
);

export const getIsConversationsSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.isConversations)
);

export const getAccountIdSelector = createSelector(
  getCAASelector,
  (caa) => caa.accountId
);

export const getClientConfigsSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.clientConfigs)
);

export const getITSBaseUrlSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.itsBaseUrl)
);

export const getShowWordCloudSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.showWordCloud)
);

export const getWordCloudContentSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.wordCloudcontent)
);

export const getModalOpenSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.modalIsOpen)
);

export const getModalStateSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.modalState)
);

export const getModalMessageSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.modalMessage)
);

export const getUnifiedPortalClientPicker = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.unifiedPortalClientPicker)
);

export const getDocPortalUrlSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.docPortalUrl)
);

export const getUnifiedPortalUrlSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.unifiedPortalUrl)
);

export const getUserTypeSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.userType)
);

export const getContactSupportUrlSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.contactSupportUrl)
);

export const getUserRoleSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.userRole)
);

export const getRoleConfigSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.roleConfig)
);

export const getOktaUserAccountUrlSelector = createSelector(
  getAppState,
  (appState) => appState.get(stateKey.oktaUserAccountUrl)
);
