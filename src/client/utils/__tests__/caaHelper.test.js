import * as caaHelper from 'utils/caaHelper';

describe('utils/caaHelper', function () {
  const clientsList = [{
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
    clientId: 'assurant',
    apps: [{
      appId: 'pyb',
      accountId: 'pyb'
    }]
  }];
  const sortedClientsList = [{
    clientId: 'assurant',
    apps: [{
      appId: 'pyb',
      accountId: 'pyb'
    }],
    componentClientId: 'assurant'
  }, {
    clientId: 'capitalone',
    apps: [{
      appId: 'chatbot',
      accountId: 'chatbot'
    }],
    componentClientId: 'capitalone'
  }, {
    clientId: 'ebay',
    apps: [{
      appId: 'uk',
      accountId: 'uk'
    }, {
      appId: 'de',
      accountId: 'de'
    }],
    componentClientId: 'ebay'
  }, {
    clientId: 'sirius',
    apps: [{
      appId: 'chatbot',
      accountId: 'chatbot'
    }],
    componentClientId: 'sirius'
  }];

  describe('getSortedClientsList', () => {
    test('should sort the clientsList', () => {
      expect(caaHelper.getSortedClientsList(clientsList)).toMatchSnapshot();
    });

    test('should sort the clientsList', () => {
      expect(caaHelper.getSortedClientsList()).toMatchSnapshot();
    });
  });

  describe('getDefaultCAA', () => {
    test('should get the default caa - first client, app, account', () => {
      expect(caaHelper.getDefaultCAA(sortedClientsList)).toMatchSnapshot();
    });

    const clientsList = [{
      clientId: 'assurant',
      componentClientId: 'assurant'
    }];
    test('should get the default caa - first client, app, account', () => {
      expect(caaHelper.getDefaultCAA(clientsList)).toMatchSnapshot();
    });
  });

  describe('getMatchingAccountId', () => {
    test('should get the default caa - first client, app, account', () => {
      expect(caaHelper.getMatchingAccountId(sortedClientsList, 'sirius', 'chatbot')).toEqual('chatbot');
    });
  });

  describe('isUserAuthorized', () => {
    test('should authorize and get the default caa when  CAA is not provided', () => {
      expect(caaHelper.isUserAuthorized(undefined, sortedClientsList)).toEqual({
        authorized: true,
        clientPicker: true,
        caa: {}
      });
    });

    test('should authorize and get the provided caa when user is authorized', () => {
      const userSelectedCAA = {
        clientId: 'sirius',
        appId: 'chatbot',
        accountId: 'chatbot',
      };
      expect(caaHelper.isUserAuthorized(userSelectedCAA, sortedClientsList)).toEqual({
        authorized: true,
        clientPicker: false,
        caa: userSelectedCAA
      });
    });

    test('should not authorize and get the default caa when user is not authorized', () => {
      const userSelectedCAA = {
        clientId: 'differentClient',
        appId: 'chatbot',
        accountId: 'chatbot',
      };
      expect(caaHelper.isUserAuthorized(userSelectedCAA, sortedClientsList)).toEqual({
        authorized: false,
        clientPicker: false,
        caa: caaHelper.getDefaultCAA(sortedClientsList)
      });
    });
  });
});
