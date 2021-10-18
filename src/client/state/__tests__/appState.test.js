import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  fromJS, List
} from 'immutable';
import Constants from 'components/../constants';
import * as appState from 'state/appState';
import * as GlobalTypes from 'state/types';
import axios from 'axios';

const mockClientConfigData = [{
  "authEnabled":true,
  "itsBaseUrl":"https://stable.developer.sv2.247-inc.net/v1/integratedtoolsuite/",
  "analyticsKey":"",
  "clientConfigs":[
     {
        "clientId":"testclientone",
        "clientDisplayName":"Test Client One",
        "accounts":[
           {
              "accountId":"testclientone",
              "accountDisplayName":"Default",
              "packageCode":"custom",
              "products":[
                 {
                    "productId":"discovery",
                    "roles":[
                       "developer"
                    ],
                    "components":[
                       {
                          "componentId":"dialogmanager",
                          "componentClientId":"testclientone",
                          "componentAccountId":"testclientone"
                       }
                    ]
                 }
              ]
           }
        ],
        "componentClientId":"testclientone",
        "apps":[
           {
              "appId":"e2etesting",
              "accountId":"testclientone",
              "enableAiva":true,
              "enableAnswers7":false
           },
           {
              "appId":"general",
              "accountId":"testclientone",
              "enableAiva":true,
              "enableAnswers7":true
           },
           {
              "appId":"integration",
              "accountId":"testclientone",
              "enableAiva":true,
              "enableAnswers7":false
           },
           {
              "appId":"testclientone",
              "accountId":"testclientone",
              "enableAiva":true,
              "enableAnswers7":false
           }
        ]
     }
  ],
  "username":"Test user",
  "userType":"Internal",
  "clientId":"tfsai",
  "appId":"referencebot",
  "componentClientId":"247ai",
  "unifiedPortalUrl":"https://stable.developer.sv2.247-inc.net/home/",
  "docPortalUrl":"https://stable.developer.sv2.247-inc.net/docportal/Content/Intent-Discovery/Intent-Discovery.htm",
  "contactSupportUrl":"https://247inc.atlassian.net/secure/RapidBoard.jspa?rapidView=1178&projectKey=SRE"
}];


jest.mock('axios');
jest.mock('utils/caaHelper')

describe('state/App:', function () {
  const caa = {
    clientId: '247ai',
    appId: 'referencebot',
    accountId: 'referencebot'
  };

  const clientConfig = [{
    clientId: 'capitalone',
    apps: [{
      appId: 'chatbot',
      accountId: 'chatbot'
    }]
  }, {
    clientId: 'sirius',
    apps: [{
      appId: 'chatbot',
      accountId: 'chatbot'
    }]
  }];

  const unifiedPortalClientPicker = false;

  const {
    appReducer,
    types,
    stateKey
  } = appState;

  describe('App Actions:', function () {
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
        conversations: {
          selectedTranscriptId: ''
        }
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    describe('getUserConfig:', () => {
      test('should dispatch getUserConfig', () => {
        axios.get.mockResolvedValue({
          data: mockClientConfigData
        });
        store.dispatch(appState.getUserConfig());
        expect(axios.get).toHaveBeenCalled();
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getConversationsConfig:', () => {
      test('should dispatch getConversationsConfig', () => {
        axios.get.mockResolvedValue({
          data: mockClientConfigData
        });
        store.dispatch(appState.getConversationsConfig());
        expect(axios.get).toHaveBeenCalled();
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('getAnswersConfig:', () => {
      test('should dispatch getAnswersConfig', () => {
        axios.get.mockResolvedValue({
          data: mockClientConfigData
        });
        store.dispatch(appState.getAnswersConfig());
        expect(axios.get).toHaveBeenCalled();
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('updateCAA:', () => {
      test('should dispatch update CAA', () => {
        store.dispatch(appState.updateCAA(caa));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setUnifiedPortalClientPicker', () => {
      test('should dispatch setUnifiedPortalClientPicker action', () => {
        store.dispatch(appState.setUnifiedPortalClientPicker(unifiedPortalClientPicker));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setUserConfig', () => {
      test('should dispatch setUserConfig action', () => {
        const userConfig = {
          authEnabled: false,
          analyticsKey: 'c8adb0c80da1f7ed082cfc43c4da0fe4',

        };
        store.dispatch(appState.setUserConfig(userConfig));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setClientsConfig', () => {
      test('should dispatch setClientsConfig action', () => {
        store.dispatch(appState.setClientsConfig(clientConfig));
        expect(store.getActions()).toMatchSnapshot();
      });

      test('should dispatch setClientsConfig action', () => {
        const emptyClientConfig = [];
        store.dispatch(appState.setClientsConfig());
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setModalIsOpen', () => {
      test('should dispatch setModalIsOpen action', () => {
        store.dispatch(appState.setModalIsOpen(true, {
          modalName: Constants.modals.confirm,
          header: `${Constants.cancelHeader} project?`,
          message: `${Constants.cancelMessage} project?`,
        }));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setModalIsOpen', () => {
      test('should dispatch setModalIsOpen action', () => {
        store.dispatch(appState.setModalIsOpen(true, {
          modalName: Constants.modals.confirm,
          header: `${Constants.cancelHeader} project?`,
          message: `${Constants.cancelMessage} project?`,
        }));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setModalMessageState', () => {
      test('should dispatch setModalMessageState action', () => {
        store.dispatch(appState.setModalMessageState('Modal is Open'));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setModalMessageState', () => {
      test('should dispatch setModalMessageState action', () => {
        store.dispatch(appState.setModalMessageState('Modal is Open'));
        expect(store.getActions()).toMatchSnapshot();
      });
    });

    describe('setModalMessage', () => {
      test('should dispatch setModalMessage action', () => {
        store.dispatch(appState.setModalMessage('Modal is Open'));
        expect(store.getActions()).toMatchSnapshot();
      });
    });
  });

  describe('App Reducers: ', function () {

    test('should return the initial state', () => {
      const newState = appReducer(undefined, {
        type: types.NOOP,
      });
      expect(newState).toEqual(appState.initialAppState);
    });

    describe('SET_CLIENTS_CONFIG:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          clientConfigs: [],
        });
      });

      test('should set the client config', () => {
        const newState = appReducer(currentState, {
          type: types.SET_CLIENTS_CONFIG,
          clientConfigs: clientConfig,
        });
        expect(newState.get(stateKey.clientConfigs).toJS()).toEqual(clientConfig);
      });
    });

    describe('SET_UNIFIED_PORTAL_CLIENT_PICKER:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          unifiedPortalClientPicker: false,
        });
      });

      test('should set the UNIFIED_PORTAL_CLIENT_PICKER', () => {
        const newState = appReducer(currentState, {
          type: types.SET_UNIFIED_PORTAL_CLIENT_PICKER,
          unifiedPortalClientPicker: true,
        });
        expect(newState.get(stateKey.unifiedPortalClientPicker)).toEqual(true);
      });
    });

    describe('SET_USER_CONFIG:', function () {
      let currentState;
      let config = {
        userName: 'testup',
        userType: 'Mar@2020',
        authEnabled: true,
        itsBaseUrl: '',
        analyticsKey: '',
        docPortalUrl: '',
        unifiedPortalUrl: '',
        contactSupportUrl: '',
      }

      beforeAll(() => {
        currentState = fromJS({
          userName: '',
          userType: '',
          authEnabled: 'false',
          itsBaseUrl: '',
          analyticsKey: '',
          docPortalUrl: '',
          unifiedPortalUrl: '',
          contactSupportUrl: '',
        });
      });

      test('should set the SET_USER_CONFIG', () => {
        const newState = appReducer(currentState, {
          type: types.SET_USER_CONFIG,
          config,
        });
        expect(newState.get(stateKey.authEnabled)).toEqual(true);
      });
    });

    describe('MODAL_IS_OPEN:', function () {
      let currentState;
      let currentModalState = {
        modalName: ''
      };

      let modalState = {
        modalName: 'Modal Name'
      };

      beforeAll(() => {
        currentState = fromJS({
          modalIsOpen: false,
          modalState: fromJS(currentModalState),
        });
      });

      test('should set the MODAL_IS_OPEN', () => {
        const newState = appReducer(currentState, {
          type: types.MODAL_IS_OPEN,
          modalIsOpen: true,
          modalState: fromJS(modalState),
        });
        expect(newState.get(stateKey.modalIsOpen)).toEqual(true);
        expect(newState.get(stateKey.modalState).toJS()).toEqual(modalState);
      });
    });

    describe('MODAL_MESSAGE:', function () {
      let currentState;

      beforeAll(() => {
        currentState = fromJS({
          modalMessage: '',
        });
      });

      test('should set the MODAL_MESSAGE', () => {
        const newState = appReducer(currentState, {
          type: types.MODAL_MESSAGE,
          modalMessage: 'Modal Message',
        });
        expect(newState.get(stateKey.modalMessage)).toEqual('Modal Message');
      });
    });

    test('LOCATION_CHANGE', () => {
      const currentState = fromJS({
          clientId: '',
          appId: '',
          accountId: '',
          componentClientId: '',
          clientConfigs: List(),
      });
      const newState = appReducer(currentState, {
        type: GlobalTypes.LOCATION_CHANGE,
        payload: {
          action: 'POP',
          location: {
            search: '?clientid=testclientone&account=service&appid=general&componentClientId=testclientone'
          },
        }
      });
      expect(newState.get(stateKey.clientId)).toEqual('testclientone');
    });
  });

  describe('AppSelectors Selectors:', function () {
    let state;
    let caa = {
      clientId: 'tfsinc',
      appId: 'idt_test',
      accountId: 'service',
      componentClientId: '247inc',
    };
    let modalState = {
      modalName: 'Modal Name'
    }

    beforeAll(() => {
      state = fromJS({
        app: {
          authEnabled: false,
          clientId: 'tfsinc',
          componentClientId: '247inc',
          appId: 'idt_test',
          accountId: 'service',
          userName: 'testup',
          userType: 'INTERNAL',
          itsBaseUrl: 'https://stable.developer.sv2.247-inc.net/v1/integratedtoolsuite/',
          analyticsKey: '',
          clientConfigs: fromJS(clientConfig),
          modalIsOpen: false,
          modalMessage: 'Modal Message',
          modalState: fromJS(modalState),
          unifiedPortalClientPicker: false,
          docPortalUrl: 'https://stable.developer.sv2.247-inc.net/docportal/Content/Intent-Discovery/Intent-Discovery.htm',
          unifiedPortalUrl: 'https://stable.developer.sv2.247-inc.net/home/',
          contactSupportUrl: 'http://chainsaw.tellme.com/~achernous/cssp/scxml/#start',
          userRole: 'admin',
          roleConfig: {},
        }
      });      
    });

    test('getAppState', function () {
      expect(appState.getAppState(state)).toEqual(state.get('app'));
    });

    test('getCAASelector', function () {
      expect(appState.getCAASelector(state)).toEqual(caa);
    });

    test('getClientIdSelector', function () {
      expect(appState.getClientIdSelector(state)).toEqual('tfsinc');
    });

    test('getComponentClientIdSelector', function () {
      expect(appState.getComponentClientIdSelector(state)).toEqual('247inc');
    });

    test('getAppIdSelector', function () {
      expect(appState.getAppIdSelector(state)).toEqual('idt_test');
    });

    test('getAccountIdSelector', function () {
      expect(appState.getAccountIdSelector(state)).toEqual('service');
    });

    test('getClientConfigsSelector', function () {
      expect(appState.getClientConfigsSelector(state)).toEqual(fromJS(clientConfig));
    });

    test('getITSBaseUrlSelector', function () {
      expect(appState.getITSBaseUrlSelector(state)).toEqual('https://stable.developer.sv2.247-inc.net/v1/integratedtoolsuite/');
    });

    test('getModalOpenSelector', function () {
      expect(appState.getModalOpenSelector(state)).toEqual(false);
    });

    test('getModalStateSelector', function () {
      expect(appState.getModalStateSelector(state)).toEqual(fromJS(modalState));
    });

    test('getModalMessageSelector', function () {
      expect(appState.getModalMessageSelector(state)).toEqual('Modal Message');
    });

    test('getUnifiedPortalClientPicker', function () {
      expect(appState.getUnifiedPortalClientPicker(state)).toEqual(false);
    });

    test('getDocPortalUrlSelector', function () {
      expect(appState.getDocPortalUrlSelector(state)).toEqual('https://stable.developer.sv2.247-inc.net/docportal/Content/Intent-Discovery/Intent-Discovery.htm');
    });

    test('getUnifiedPortalUrlSelector', function () {
      expect(appState.getUnifiedPortalUrlSelector(state)).toEqual('https://stable.developer.sv2.247-inc.net/home/');
    });

    test('getUserTypeSelector', function () {
      expect(appState.getUserTypeSelector(state)).toEqual('INTERNAL');
    });

    test('getContactSupportUrlSelector', function () {
      expect(appState.getContactSupportUrlSelector(state)).toEqual('http://chainsaw.tellme.com/~achernous/cssp/scxml/#start');
    });

    test('getRoleConfigSelector', function () {
      expect(appState.getRoleConfigSelector(state)).toEqual(fromJS({}));
    });

    test('getUserRoleSelector', function () {
      expect(appState.getUserRoleSelector(state)).toEqual('admin');
    });
  });
});
