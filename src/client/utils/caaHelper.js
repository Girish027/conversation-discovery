import appLogger from 'utils/appLogger';
import memoizeOne from 'memoize-one';

const devlog = appLogger({ tag: 'caaHelper' });

export const getSortedClientsList = (clientsList = []) => clientsList
  .map((config) => ([config.clientId.toLowerCase(), config]))
// eslint-disable-next-line no-nested-ternary
  .sort((a, b) => (a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0))
  .map(([, config]) => config);


export const getDefaultCAA = (sortedClientsList) => {
  const { clientId, apps = [{}], componentClientId } = sortedClientsList[0];
  const { appId, accountId } = apps[0];
  return {
    clientId,
    appId,
    accountId,
    componentClientId,
  };
};

export const getMatchingAccountId = memoizeOne((clientConfigs, clientId, appId) => {
  const matchingClient = clientConfigs.find((cl) => cl.clientId === clientId) || {};
  const { apps = [] } = matchingClient;
  const matchingApp = apps.find((app) => app.appId === appId) || {};
  const { accountId = 'default' } = matchingApp;
  return accountId;
});

export const getComponentClientIdForClient = memoizeOne((clientConfigs, clientId) => {
  const matchingClient = clientConfigs.find((cl) => cl.clientId === clientId) || {};
  return matchingClient.componentClientId;
});

export const isUserAuthorized = (userSelectedCAA = {}, clientsList = [{}]) => {
  try {
    const {
      clientId: userClientId,
      appId: userAppId,
      accountId: userAccountId
    } = userSelectedCAA;
    // caa information is neither present in URL or cookie
    // user is authorized to view default CAA
    if (userClientId === undefined || userClientId === '') {
      if (clientsList.length === 1 && clientsList[0].apps.length === 1) {
        return {
          authorized: true,
          clientPicker: false,
          caa: getDefaultCAA(clientsList)
        };
      }
      return {
        authorized: true,
        clientPicker: true,
        caa: {}
      };
    }

    // caa information is present in URL.
    const clientConfig = clientsList.find((client) => client.clientId === userClientId);
    if (clientConfig) {
      if (userAppId === undefined && userAccountId === '') {
        if (clientConfig.apps.length === 1) {
          return {
            authorized: true,
            clientPicker: false,
            caa: {
              clientId: userClientId,
              appId: clientConfig.apps[0].appId,
              accountId: clientConfig.apps[0].accountId,
              componentClientId: clientConfig.componentClientId,
            }
          };
        }
        return {
          authorized: true,
          clientPicker: true,
          caa: {}
        };
      }

      let appDetails = clientConfig.apps.find((app) => app.appId === userAppId);
      if (!appDetails) {
        const [first] = clientConfig.apps;
        if (first) {
          appDetails = first;
        }
      }
      // we were able to find matching client and app.
      const { accountId, appId } = appDetails;
      userSelectedCAA.appId = appId;
      userSelectedCAA.accountId = accountId;
      userSelectedCAA.componentClientId = clientConfig.componentClientId;

      return {
        authorized: true,
        clientPicker: false,
        caa: userSelectedCAA
      };
    }
  } catch (err) {
    devlog.warn(err);
  }
  // return false and defaultCAA if we were not able to find matching CAA in clientsList
  return {
    authorized: false,
    clientPicker: false,
    caa: getDefaultCAA(clientsList)
  };
};
