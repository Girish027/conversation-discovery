import {
  fromJS, Map
} from 'immutable';
import { createSelector } from 'reselect';
import axios from 'axios'; // this module is Promise based HTTP client for the browser and node.js
import appLogger from 'utils/appLogger';
import { getUserConfig } from 'state/appState';
import constants from '../constants';
import { initializeAnalytics, logAmplitudeEvent } from '../utils/amplitudeUtils';

export const types = {
  AUTHENTICATION_COMPLETE: 'auth/AUTHENTICATION_COMPLETE',
  LOGGED_OUT: 'auth/LOGGED_OUT'
};

export const stateKey = {
  name: 'name',
  oktaUrl: 'oktaUrl',
  email: 'email'
};

const devlog = appLogger({ tag: 'authenticationState' });

export const initialAuthState = fromJS({
  name: 'User Name',
  oktaUrl: ''
});

export const actionCompletedAuth = (userInfo) => ({
  type: types.AUTHENTICATION_COMPLETE,
  userInfo
});

export const actionLoggedoutAuth = () => ({
  type: types.LOGGED_OUT
});

export const getAuthUserinfo = () => (dispatch) => {
  axios.get(constants.serverApiUrls.authentications)
    .then((res) => {
      const authInfoArray = res.data;
      if (Array.isArray(authInfoArray) && authInfoArray.length) {
        const authInfo = authInfoArray[0];
        const userInfo = {
          name: authInfo.name,
          oktaUrl: authInfo.oktaUrl,
          email: authInfo.email,
        };
        initializeAnalytics(authInfo.analyticsKey, authInfo.name);
        const IDTUserEvent = { username: authInfo.name, toolId: constants.toolName, env: constants.environment };
        logAmplitudeEvent('IDTUser', IDTUserEvent);
        dispatch(actionCompletedAuth(userInfo));
        dispatch(getUserConfig());
      } else {
        dispatch(actionLoggedoutAuth());
      }
    })
    .catch((fetchErr) => {
      devlog.error(fetchErr);
    });
};

// REDUCER
export const authReducer = (state = initialAuthState, action = {}) => {
  switch (action.type) {
    case types.AUTHENTICATION_COMPLETE:
      return state.merge(Map(action.userInfo));
    case types.LOGGED_OUT:
      return initialAuthState;
    default:
      return state;
  }
};

// SELECTORS
export const getAuthState = (state) => state.get('auth');

export const getAuthNameSelector = createSelector(
  getAuthState,
  (authState) => authState.get(stateKey.name),
);

export const getOktaUrlSelector = createSelector(
  getAuthState,
  (authState) => authState.get(stateKey.oktaUrl),
);

export const getEmailSelector = createSelector(
  getAuthState,
  (authState) => authState.get(stateKey.email),
);
