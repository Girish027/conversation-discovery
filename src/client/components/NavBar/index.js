import { connect } from 'react-redux';
import NavBar from './NavBar';

import {
  getAuthNameSelector,
  getOktaUrlSelector,
  getEmailSelector
} from '../../state/authenticationState';

import {
  getClientIdSelector,
  getAppIdSelector,
  getClientConfigsSelector,
  getComponentClientIdSelector,
  getUnifiedPortalClientPicker,
  getDocPortalUrlSelector,
  getUnifiedPortalUrlSelector,
  getUserTypeSelector,
  getContactSupportUrlSelector,
  getOktaUserAccountUrlSelector,
} from '../../state/appState';

const mapStateToProps = (state) => ({
  userName: getAuthNameSelector(state),
  oktaUrl: getOktaUrlSelector(state),
  email: getEmailSelector(state),
  clientId: getClientIdSelector(state),
  appId: getAppIdSelector(state),
  componentClientId: getComponentClientIdSelector(state),
  clientConfigs: getClientConfigsSelector(state),
  unifiedPortalClientPicker: getUnifiedPortalClientPicker(state),
  docPortalUrl: getDocPortalUrlSelector(state),
  unifiedPortalUrl: getUnifiedPortalUrlSelector(state),
  userType: getUserTypeSelector(state),
  contactSupportUrl: getContactSupportUrlSelector(state),
  oktaUserAccountUrl: getOktaUserAccountUrlSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
