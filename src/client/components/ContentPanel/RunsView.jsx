import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Plus, Button, ContextualActionsBar, ContextualActionItem,
} from '@tfs/ui-components';
import { List, fromJS } from 'immutable';
import { runOverviewStyle } from 'styles';
import { downloadFile } from 'utils/FileUtils';
import {
  setModalIsOpen,
  getCAASelector,
  getClientIdSelector,
  getRoleConfigSelector,
} from 'state/appState';

import {
  runSelectors,
} from 'state/runsState';

import {
  projectSelectors,
} from 'state/projectsState';
import { headerActions } from 'state/headerState';
import * as ValidationUtils from '../../utils/ValidationUtils';
import Language from '../../Language';
import Constants from '../../constants';
import Placeholder from 'components/Placeholder';
import RunsTable from 'components/Table/RunsTable';
import LoadingIndicator from 'components/LoadingIndicator';

export class RunsView extends Component {
  constructor(props) {
    super(props);

    this.renderRunsList = this.renderRunsList.bind(this);
  }

  downloadDatasetTemplate = () => {
    const { caa } = this.props;
    const locationUrl = Constants.serverApiUrls.downloadTemplate(caa);
    downloadFile(locationUrl);
  }

  createNewProject = () => {
    const { dispatch, clientId } = this.props;
    const isValidObj = ValidationUtils.createProjectValidation(0, clientId);
    if (isValidObj && !isValidObj.isValid) {
      dispatch(headerActions.showNotificationWithTimer(isValidObj.message, Constants.notification.error));
      return;
    }
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.createProject,
    }));
  }

  createNewRun = () => {
    const { runs: runImmutable, dispatch } = this.props;
    const runs = runImmutable.toJS();
    const numberOfRuns = runs.length;
    if (ValidationUtils.validateClientRunLimit(numberOfRuns)) {
      dispatch(headerActions.showNotificationWithTimer(
        Language.ERROR_MESSAGES.maxRunNumberExceeded(Constants.RUN_LIMIT), Constants.notification.error)
      );
      return;
    }
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.createRun,
      header: Constants.modalInfo.createRun.header,
    }));
  }

  renderRunsList() {
    const {
      runs: runsImmutable, runCount, activeProjectId, activeProject, roleConfig,
    } = this.props;
    const runs = runsImmutable.toJS();
    const { projectName, projectType } = activeProject.toJS();

    if (runCount === -1) {
      return (
        <Placeholder>
          <div className='message-default'>
            <LoadingIndicator isHerbie message='Loading Analyses...' />
          </div>
        </Placeholder>
      );
    }

    if (runCount === 0) {
      return (
        <Placeholder>
          <div className='message-default'> You have not run intent discovery for this dataset. </div>
          { roleConfig.runNewAnalysis ? (
            <Button
              type='flat'
              name='create-run-2'
              onClick={this.createNewRun}
            >
              <ContextualActionItem
                icon={Plus}
              >
                {Constants.buttons.createNewRun}
              </ContextualActionItem>
            </Button>
          ) : null }
        </Placeholder>
      );
    }

    return (
      <RunsTable
        data={runs}
        projectId={activeProjectId}
        projectName={projectName}
        projectType={projectType}
        roleConfig={roleConfig}
      />
    );
  }

  renderEmptyPage() {
    const { roleConfig } = this.props;
    return (
      <div className='empty-project'>
        <div className='message-left'>
          Discover potential intents from your transcripts.
        </div>
        <div className='list-left'>
          <div>
            {' '}
1.
            <strong> Upload</strong>
            {' '}
your transcripts as a .csv file
            {' '}
            <Button
              onClick={this.downloadDatasetTemplate}
              type='flat'
              styleOverride={{
                fontFamily: 'Lato',
                fontSize: '12px',
                color: '#004c97',
                fontWeight: 'normal'
              }}
            >
              Download template
            </Button>
          </div>
          <div>
            {' '}
2.
            <strong> Review</strong>
            {' '}
the list of potential intents
            {' '}
          </div>
          <div>
            {' '}
3.
            <strong> Refine</strong>
            {' '}
the results
            {' '}
          </div>
          <div>
            {' '}
4.
            <strong> Add</strong>
            {' '}
to
            <strong> Conversations</strong>
            {' '}

          </div>
        </div>
        <div className='create-project'>
          { roleConfig.uploadNewTranscript ? (
            <Button
              type='primary'
              name='create-project-2'
              onClick={this.createNewProject}
              styleOverride={runOverviewStyle.uploadYourTranscripts}
            >
              {Constants.buttons.uploadYourTranscripts}
            </Button>
          ) : null }
        </div>
      </div>
    );
  }

  render() {
    const { projectCount, roleConfig } = this.props;

    if (projectCount === -1) {
      return (
        <Placeholder>
          <div className='message-default'>
            <LoadingIndicator isHerbie message='Loading Transcripts...' />
          </div>
        </Placeholder>
      );
    }
    if (projectCount === 0) {
      return (
        <div>{this.renderEmptyPage()}</div>
      );
    }

    return (
      <div className='runs-view'>
        <ContextualActionsBar>
          <div style={{ marginTop: '1px' }}>
            { roleConfig.runNewAnalysis ? (
              <ContextualActionItem
                icon={Plus}
                onClickAction={this.createNewRun}
              >
                {Constants.buttons.createNewRun}
              </ContextualActionItem>
            ) : null }
          </div>
        </ContextualActionsBar>
        {this.renderRunsList()}
      </div>

    );
  }
}

RunsView.propTypes = {
  dispatch: PropTypes.func,
  activeProjectId: PropTypes.string,
  caa: PropTypes.object.isRequired,
  activeProject: PropTypes.object,
  runs: PropTypes.object,
  clientId: PropTypes.string,
  projectCount: PropTypes.number,
  runCount: PropTypes.number,
  roleConfig: PropTypes.object,
};

RunsView.defaultProps = {
  dispatch: () => { },
  activeProjectId: '',
  activeProject: fromJS({}),
  runs: new List([]),
  projectCount: '',
  runCount: '',
  roleConfig: {},
};

const mapStateToProps = (state) => ({
  activeProjectId: projectSelectors.getActiveProjectId(state) || '',
  caa: getCAASelector(state),
  // TODO: uncomment after CFD-101 - Dataset validation and Project lifecycle
  activeProject: projectSelectors.getActiveProject(state),
  runs: runSelectors.getRunsList(state) || new List([]),
  clientId: getClientIdSelector(state),
  projectCount: projectSelectors.getProjectCount(state),
  runCount: runSelectors.getRunCount(state),
  roleConfig: getRoleConfigSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(RunsView);
