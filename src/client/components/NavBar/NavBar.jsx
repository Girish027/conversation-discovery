import React from 'react';
import PropTypes from 'prop-types';
import { NavBar as TfsNavBar, MultiLevelPicker } from '@tfs/ui-components';
import axios from 'axios';
import { fromJS } from 'immutable';
import { convertFirstLetterUppercase } from 'utils/stringOperations';
import appLogger from 'utils/appLogger';
import { getMatchingAccountId, getComponentClientIdForClient } from 'utils/caaHelper';
import {
  getAuthUserinfo
} from 'state/authenticationState';
import { routeNames, getRoute } from 'utils/RouteHelper';
import { push } from 'connected-react-router';
import {
  // registerSessionCAA,
  changeClient,
} from 'state/appState';
import constants from '../../constants';
import _ from 'lodash';
import { logAmplitudeEvent } from '../../utils/amplitudeUtils';
import LogoutWarningDialog from './LogoutWarningDialog';

const devlog = appLogger({ tag: 'NavBar' });

export default class NavBar extends TfsNavBar {
  constructor(props) {
    super(props);
    this.logoutOkta = this.logoutOkta.bind(this);
    this.onClientAppSelected = this.onClientAppSelected.bind(this);
    this.onClientPickerSelect = this.onClientPickerSelect.bind(this);
    this.productNameSelected = this.productNameSelected.bind(this);
    this.getClientAppConfigArray = this.getClientAppConfigArray.bind(this);
    this.clientsConfig = {
      title: 'Choose Workspace',
      items: [],
    };

    this.state = {
      showClientPicker: false,
      selectedClientConfig: {},
      showLogoutWarning: false,
    };
    this.displayClientName = [];
    this.selectedClientName = '';
    this.isCloseDisabled = true;
  }

  componentDidMount() {
    this.props.dispatch(getAuthUserinfo());
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.unifiedPortalClientPicker !== nextProps.unifiedPortalClientPicker) {
      const { clientId, appId } = this.props;
      this.setState({
        showClientPicker:
          nextProps.unifiedPortalClientPicker,
        selectedClientConfig: { clientId, appId },
      });
    }
  }

  getClientAppConfigArray(clientsConfig) {
    if (_.isEmpty(clientsConfig) || !clientsConfig.items.length) {
      const { clientConfigs } = this.props;
      const clientList = clientConfigs.toJS();

      if (clientList.items && clientList.items.length > 0) {
        return clientList;
      }

      if (!_.isNil(clientList) && clientList.length > 0) {
        let currentClient = clientList[0].clientId;
        const getAppsList = (accumulator = [], clientEntry) => {
          accumulator.push({
            title: clientEntry.appId,
            field: 'appId',
            data: {
              appId: clientEntry.appId,
            },
          });
          return accumulator;
        };

        clientList.forEach((client, index) => {
          const existingConfig = clientsConfig.items.find((config) => config.title === client.clientId);
          if (_.isNil(existingConfig)) {
            currentClient = client.clientId;
            const clientName = client.clientDisplayName;
            const clientEntries = clientList.slice(index).filter((cl) => cl.clientId === currentClient);
            const items = clientEntries[0].apps.reduce(getAppsList, []);
            clientsConfig.items.push({
              title: clientName,
              field: 'clientId',
              data: {
                clientId: currentClient,
              },
              items,
            });
          }
        });
      }
    }
    return clientsConfig;
  }

  logoutOkta() {
    axios(`${this.props.oktaUrl}${constants.oktaApiUrls.currentSession}`, {
      method: 'DELETE',
      withCredentials: true
    })
      .then(() => {
        const IDTUserLogOutEvent = { username: this.props.userName, toolId: constants.toolName, env: constants.environment };
        logAmplitudeEvent('IDTUserLogOutEvent', IDTUserLogOutEvent);
        window.location.href = constants.navbar.logoutUrl;
      })
      .catch((err) => {
        devlog.trace(err.response);
      });
  }

  onClientAppSelected(newClientId, newAppId) {
    const clientConfigs = this.props.clientConfigs.toJS();
    const {
      clientId, appId, componentClientId, dispatch
    } = this.props;
    let newComponentClientId = componentClientId;

    if (clientId !== newClientId || appId !== newAppId) {
      if (clientId !== newClientId || newComponentClientId === undefined || newComponentClientId === '') {
        newComponentClientId = getComponentClientIdForClient(clientConfigs, newClientId);
      }
      const newAccountId = getMatchingAccountId(clientConfigs, newClientId, newAppId);
      dispatch(changeClient({
        clientId: newClientId,
        appId: newAppId,
        accountId: newAccountId,
        componentClientId: newComponentClientId
      }));

      const newRoute = getRoute(routeNames.DISCOVER_INTENTS, {
        clientId: newClientId,
        appId: newAppId,
        accountId: newAccountId,
        componentClientId: newComponentClientId
      });
      dispatch(push(newRoute));
    }
  }

  productNameSelected() {
    const clientConfigs = this.props.clientConfigs.toJS();
    const {
      clientId, appId, componentClientId, dispatch
    } = this.props;
    const newComponentClientId = componentClientId;

    const newAccountId = getMatchingAccountId(clientConfigs, clientId, appId);

    const newRoute = getRoute(routeNames.DISCOVER_INTENTS, {
      clientId,
      appId,
      accountId: newAccountId,
      componentClientId: newComponentClientId
    });
    dispatch(push(newRoute));
  }

  onClientPickerSelect(selectedClientConfig) {
    const {
      clientId, appId, title,
    } = selectedClientConfig;

    if (title.length > 0) {
      this.displayClientName = [title[0], convertFirstLetterUppercase(title[1])];
      const [first] = title;
      this.selectedClientName = first;
    }

    if (clientId && appId) {
      this.setState({
        showClientPicker: false,
        selectedClientConfig: {
          clientId,
          appId,
        },
      }, () => {
        this.onClientAppSelected(clientId, appId);
      });
    }
  }

  getIconLink = () => {
    const { unifiedPortalUrl } = this.props;
    const iconName = `${constants.ICON_DISCOVERY}.svg`;
    return `${unifiedPortalUrl}assets/${iconName}`;
  }

  render() {
    const { clientId = ' ', appId = '', clientConfigs } = this.props;
    let { userName } = this.props;
    const { contactSupportUrl, oktaUserAccountUrl } = this.props;
    const { email } = this.props;
    const { docPortalUrl, unifiedPortalUrl } = this.props;
    const { showClientPicker, selectedClientConfig, showLogoutWarning } = this.state;
    const unifiedPortalLink = `${unifiedPortalUrl}?clientid=${clientId}`;
    const clientList = clientConfigs.toJS();
    if ((_.isEmpty(this.clientsConfig) || !this.clientsConfig.items.length) && !_.isNil(clientList) && clientList.length > 0) {
      this.clientsConfig = this.getClientAppConfigArray(this.clientsConfig);
    }

    // TODO: user name should be full name instead of generating from email.(See authentication.js)
    userName = convertFirstLetterUppercase(userName);

    if ((this.selectedClientName === clientId || this.selectedClientName === '') && clientId && appId) {
      this.selectedClientName = clientId;
      for (let i = 0; i < clientList.length; i += 1) {
        const client = clientList[i];

        if (client.clientId === clientId) {
          this.selectedClientName = client.clientDisplayName;
          break;
        }
      }
      this.displayClientName = [this.selectedClientName, convertFirstLetterUppercase(appId)];
    }

    return (
      <div>
        <MultiLevelPicker
          show={showClientPicker}
          config={this.clientsConfig}
          selection={selectedClientConfig}
          maxDepth={2}
          shouldRetainState
          shouldAutoSelect
          isCloseDisabled={this.isCloseDisabled}
          onCancel={() => this.setState({ showClientPicker: false })}
          onSelect={this.onClientPickerSelect}
        />
        { showLogoutWarning
          && (
            <LogoutWarningDialog
              isOpen
              onClose={() => {
                this.setState({ showLogoutWarning: false });
              }}
              onClickOk={this.logoutOkta}
              productName={constants.navbar.title}
              iconLink={this.getIconLink()}
            />
          )}
        <TfsNavBar
          clientValues={this.displayClientName}
          defaultClientLabel='CHOOSE APP'
          productName={constants.navbar.title}
          onClickProductName={this.productNameSelected}
          homeLink={unifiedPortalLink}
          docLink={docPortalUrl}
          supportLink={contactSupportUrl}
          userInfo={{
            name: userName,
            email,
            onSignOut: () => {
              this.setState({ showLogoutWarning: true });
            },
            accountLink: oktaUserAccountUrl
          }}
          onClickClient={() => {
            this.isCloseDisabled = false;
            this.setState({ showClientPicker: true });
          }}
        />
      </div>
    );
  }
}

NavBar.propTypes = {
  dispatch: PropTypes.func,
  userName: PropTypes.string,
  oktaUrl: PropTypes.string,
  email: PropTypes.string,
  clientId: PropTypes.string,
  componentClientId: PropTypes.string,
  appId: PropTypes.string,
  clientConfigs: PropTypes.object,
  unifiedPortalClientPicker: PropTypes.bool,
  docPortalUrl: PropTypes.string,
  unifiedPortalUrl: PropTypes.string,
};

NavBar.defaultProps = {
  userName: 'userName',
  email: 'email',
  oktaUrl: '',
  clientId: '',
  componentClientId: '',
  appId: '',
  clientConfigs: fromJS([]),
  unifiedPortalClientPicker: false,
  docPortalUrl: '',
  unifiedPortalUrl: '',
  dispatch: () => {},
};
