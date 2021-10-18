import { connect } from 'react-redux';
import PageHeader from './PageHeader';
import { getPathnameSelector } from 'state/routerState';

import { getCAASelector, getITSBaseUrlSelector } from 'state/appState';
import { getActiveProject } from 'state/projectsState';
import { getSelectedRun } from 'state/runsState';
import { headerSelectors } from 'state/headerState';

const mapStateToProps = (state) => ({
  routeName: getPathnameSelector(state),
  caa: getCAASelector(state),
  itsBaseUrl: getITSBaseUrlSelector(state),
  activeProject: getActiveProject(state),
  selectedRun: getSelectedRun(state),
  header: headerSelectors.getNotifications(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(PageHeader);
