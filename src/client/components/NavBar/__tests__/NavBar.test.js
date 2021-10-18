import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import NavBar from 'components/NavBar/NavBar';
import { fromJS } from 'immutable';
import * as authState from 'state/authenticationState';
import * as appState from 'state/appState';

jest.mock('state/appState');

describe('<NavBar />', function () {
  let wrapper;

  const caa = {
    clientId: 'assurant',
    appId: 'pyb',
    accountId: 'pyb',
  };
  const clientConfigs = [{
    clientId: 'assurant',
    apps: [{
      appId: 'pyb',
      accountId: 'pyb'
    }]
  }, {
    clientId: 'capitalone',
    apps: [{
      appId: 'chatbot',
      accountId: 'chatbot'
    }]
  }, {
    clientId: 'ebay',
    apps: [{
      appId: 'uk',
      accountId: 'uk'
    }, {
      appId: 'de',
      accountId: 'de'
    }]
  }, {
    clientId: 'sirius',
    apps: [{
      appId: 'chatbot',
      accountId: 'chatbot'
    }]
  }];


  const props = {
    ...caa,
    clientConfigs: fromJS(clientConfigs),
    userName: 'abc def',
    oktaUrl: 'http://okta.com',
    dispatch: () => {},
  };

  beforeEach(function () {
    authState.getAuthUserinfo = jest.fn(() => 'getAuthUserinfo');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  const getShallowWrapper = (propsObj) => shallow(<NavBar
    {...propsObj}
  />);

  describe('Creating an instance', () => {
    test('should exist - basic NavBar component', () => {
      wrapper = getShallowWrapper(props);
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Snapshots', () => {
    test('renders correctly when information is not yet available', () => {
      wrapper = getShallowWrapper();
      expect(toJSON(wrapper)).toMatchSnapshot();
    });

    test('renders correctly when there is information', () => {
      wrapper = getShallowWrapper(props);
      expect(toJSON(wrapper)).toMatchSnapshot();
    });
  });

  describe('Functionality:', () => {
    beforeAll(() => {
      props.dispatch = jest.fn();
      appState.changeClient = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onClientAppSelected', () => {
      test('should dispatch action to change client, if selected client changes', () => {
        appState.changeClient.mockReturnValue('changeClient');
        wrapper = getShallowWrapper(props);
        wrapper.instance().onClientAppSelected('ebay', 'uk');
        expect(appState.changeClient).toHaveBeenCalledWith({
          clientId: 'ebay',
          appId: 'uk',
          accountId: 'uk',
        });
        expect(props.dispatch).toHaveBeenCalledWith('changeClient');
      });

      test('should not dispatch action to change client, if the newly selected client is same', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().onClientAppSelected('assurant', 'pyb');
        expect(props.dispatch).not.toHaveBeenCalledWith('changeClient');
      });

      test('productNameSelected - should push reload route', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().productNameSelected();
        expect(props.dispatch).toHaveBeenCalled();
      });

      test('should change the state and update the selected client and app', () => {
        wrapper = getShallowWrapper(props);
        wrapper.instance().onClientPickerSelect({
          clientId: 'assurant',
          appId: 'pyb',
          title: '',
        });
        expect(wrapper.state().showClientPicker).toEqual(false);
        expect(wrapper.state().selectedClientConfig).toEqual({ clientId: 'assurant', appId: 'pyb' });
      });

      test('should format the client config as per new navbar', () => {
        const config = {
          title: 'Choose Workspace',
          items: [],
        };

        const clientConfig = [{
          clientId: 'assurant',
          clientDisplayName: 'componentAssurant',
          apps: [{
            appId: 'pyb',
            accountId: 'pyb'
          }]
        }];

        const newProps = {
          ...caa,
          clientConfigs: fromJS(clientConfig),
          userName: 'abc def',
          oktaUrl: 'http://okta.com',
          dispatch: () => {},
        };

        wrapper = getShallowWrapper(newProps);
        const clientList = wrapper.instance().getClientAppConfigArray(config);
        expect(clientList).toEqual({
          items: [
            {
              data: {
                clientId: 'assurant'
              },
              field: 'clientId',
              items: [
                {
                  data: {
                    appId: 'pyb'
                  },
                  field: 'appId',
                  title: 'pyb'
                }
              ],
              title: 'componentAssurant'
            }
          ],
          title: 'Choose Workspace'
        });
      });
    });
  });
});
