import * as authenticationState from 'state/authenticationState';
import axios from 'axios';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  fromJS, List
} from 'immutable';
import constants from 'components/../constants';
import MockAdapter from 'axios-mock-adapter';

const configRes = { 
  data :[
    {
      name:'Test user',
      analyticsKey:'',
      isAuthenticated:true,
      oktaUrl:'https://login.247ai.com/',
      email:'testup@247.ai'
    }
  ]
};

describe('state/Authentication:', function () {

  const {
    authReducer,
    types,
    stateKey
  } = authenticationState;

  describe('Authentication Actions:', function () {
    let store;

    beforeAll(() => {
      const middlewares = [thunk];
      const mockStore = configureStore(middlewares);
      store = mockStore(fromJS({
        auth: {
          name: 'User Name',
          oktaUrl: '',
          email: ''
        }
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('actionCompletedAuth:', () => {
      test('should dispatch authentication complete', () => {
        const userInfo = {
          name: 'testuser',
          oktaUrl: 'okta-url',
          email: 'abc@xyz.com',
        };
        store.dispatch(authenticationState.actionCompletedAuth(userInfo));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('actionLoggedoutAuth:', () => {
      test('should dispatch logout ', () => {
        store.dispatch(authenticationState.actionLoggedoutAuth());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getAuthUserinfo:', () => {
      beforeAll(() =>{
        authenticationState.actionCompletedAuth = jest.fn(() => 'actionCompletedAuth');
      });
      test('should make get call to get authentication details', () => {
        var mock = new MockAdapter(axios);
        mock.onGet(constants.serverApiUrls.authentications).reply(200, configRes);
        store.dispatch(authenticationState.getAuthUserinfo());
        // authenticationState.getAuthUserinfo();
        expect(store.getActions()).toMatchSnapshot();
        // expect(authenticationState.actionCompletedAuth).toHaveBeenCalled();
      });
    });

  });

  describe('Authentication Reducers: ', function () {

    test('should return the initial state', () => {
      const newState = authReducer(undefined, {
        type: types.NOOP,
      });
      expect(newState).toEqual(authenticationState.initialAuthState);
    });

    describe('AUTHENTICATION_COMPLETE:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          name: 'User Name',
          oktaUrl: '',
          email: ''
        });
      });

      test('should set the userInfo ', () => {
        const userInfo = {
          name: 'testuser',
          oktaUrl: 'okta-url',
          email: 'abc@xyz.com',
        };
        const newState = authReducer(currentState, {
          type: types.AUTHENTICATION_COMPLETE,
          userInfo,
        });
        expect(newState.get(stateKey.name)).toEqual(userInfo.name);
        expect(newState.get(stateKey.email)).toEqual(userInfo.email);
        expect(newState.get(stateKey.oktaUrl)).toEqual(userInfo.oktaUrl);
      });
    });

    describe('LOGGED_OUT:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          name: 'testuser',
          oktaUrl: 'okta-url',
          email: 'abc@xyz.com',
        });
      });

      test('should set the initial userInfo ', () => {
        const newState = authReducer(currentState, {
          type: types.LOGGED_OUT,
        });
        expect(newState.get(stateKey.name)).toEqual('User Name');
        expect(newState.get(stateKey.oktaUrl)).toEqual('');
      });
    });

  });


  describe('AuthSelectors Selectors:', function () {
    let state;

    beforeAll(() => {
      state = fromJS({
        auth: {
          name: 'testuser',
          oktaUrl: 'okta-url',
          email: 'abc@xyz.com',
        }
      });      
    });

    test('getAuthState', function () {
      expect(authenticationState.getAuthState(state)).toEqual(state.get('auth'));
    });

    test('getAuthNameSelector', function () {
      expect(authenticationState.getAuthNameSelector(state)).toEqual('testuser');
    });

    test('getOktaUrlSelector', function () {
      expect(authenticationState.getOktaUrlSelector(state)).toEqual('okta-url');
    });

    test('getEmailSelector', function () {
      expect(authenticationState.getEmailSelector(state)).toEqual('abc@xyz.com');
    });

  });
});