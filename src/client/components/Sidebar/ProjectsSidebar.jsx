import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Plus
} from '@tfs/ui-components';
import { List } from 'immutable';
import IconButton from 'components/IconButton';

import {
  setModalIsOpen,
  getCAASelector,
  getClientIdSelector,
  getRoleConfigSelector,
} from 'state/appState';
import {
  projectActions,
  projectSelectors,
} from 'state/projectsState';
import { headerActions } from 'state/headerState';
import * as ValidationUtils from '../../utils/ValidationUtils';

// '../../ValidationUtils';
import Constants from '../../constants';
import ProjectListItem from './ProjectListItem';

export class ProjectsSidebar extends Component {
  constructor(props) {
    super(props);

    this.onClickCreateProject = this.onClickCreateProject.bind(this);
    this.onSelectProject = this.onSelectProject.bind(this);
    this.onFocusProjectItem = this.onFocusProjectItem.bind(this);
    this.clearFocus = this.clearFocus.bind(this);
    this.renderManualProjectList = this.renderManualProjectList.bind(this);
    this.renderSystemProjectList = this.renderSystemProjectList.bind(this);
    this.checkType = this.checkType.bind(this);
    this.getSystemProjectList = this.getSystemProjectList.bind(this);
    this.renderSystemProjectWorkSpace = this.renderSystemProjectWorkSpace.bind(this);
    this.renderManualProjectWorkSpace = this.renderManualProjectWorkSpace.bind(this);

    this.projectTimer = null;

    this.state = {
      caa: {},
      shouldFetchProjects: false,
      activeProjectId: '',
      focusedProjectId: '',
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { caa: existingCAA } = state;
    const { caa: newCAA, activeProjectId } = props;
    const newState = {
      activeProjectId
    };
    if (!_.isEqual(existingCAA, newCAA)) {
      newState.caa = newCAA;
      newState.shouldFetchProjects = true;
    } else {
      newState.shouldFetchProjects = false;
    }
    return newState;
  }

  componentDidUpdate() {
    const { dispatch } = this.props;
    const { shouldFetchProjects, caa } = this.state;
    if (shouldFetchProjects) {
      dispatch(projectActions.getAllProjects(caa));
    }
  }

  onClickCreateProject() {
    const { projects: projectsImmutable, dispatch, clientId } = this.props;
    const projects = projectsImmutable.toJS();
    const numberOfProjects = projects.length;
    const isValidObj = ValidationUtils.createProjectValidation(numberOfProjects, clientId);
    if (isValidObj && !isValidObj.isValid) {
      dispatch(headerActions.showNotificationWithTimer(isValidObj.message, Constants.notification.error));
      return;
    }
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.createProject,
    }));
  }

  onFocusProjectItem(projectId, inFocus) {
    if (inFocus) {
      this.setState({
        focusedProjectId: projectId
      });
    }
  }

  onSelectProject(projectId) {
    const { dispatch } = this.props;
    dispatch(projectActions.selectProject(projectId));
  }

  getSystemProjectList() {
    const { projects: projectsImmutable } = this.props;
    const systemProjects = projectsImmutable.toJS();
    return systemProjects.filter((project) => this.checkType(project, Constants.projects.SYSTEM));
  }

  clearFocus() {
    this.setState({
      focusedProjectId: ''
    });
  }

  checkType(project, type) {
    const { projectType } = project;
    if (projectType === type) {
      return true;
    }
    return false;
  }

  renderManualProjectList() {
    const { focusedProjectId, activeProjectId } = this.state;
    const { projects: projectsImmutable, dispatch, roleConfig } = this.props;
    const manualProjects = projectsImmutable.toJS();

    let manualListItems = manualProjects.filter((project) => this.checkType(project, Constants.projects.MANUAL));

    if (manualListItems.length > 0) {
      manualListItems = manualListItems.map((project) => {
        const { projectId, projectName } = project;
        const selected = projectId === activeProjectId;
        return (
          <ProjectListItem
            sticky={selected ? 'sticky' : ''}
            key={`listitem-${projectName}`}
            onClickListItem={this.onSelectProject}
            onFocusItem={this.onFocusProjectItem}
            focused={projectId === focusedProjectId}
            selected={selected}
            dispatch={dispatch}
            roleConfig={roleConfig}
            {...project}
          />
        );
      });
    }

    return (manualListItems);
  }

  renderSystemProjectList(systemListItems) {
    const { focusedProjectId, activeProjectId } = this.state;
    const { dispatch, roleConfig } = this.props;

    systemListItems = systemListItems.map((project) => {
      const { projectId, projectName } = project;
      const selected = projectId === activeProjectId;
      return (
        <ProjectListItem
          sticky={selected ? 'sticky' : ''}
          key={`listitem-${projectName}`}
          onClickListItem={this.onSelectProject}
          onFocusItem={this.onFocusProjectItem}
          focused={projectId === focusedProjectId}
          selected={selected}
          dispatch={dispatch}
          roleConfig={roleConfig}
          {...project}
        />
      );
    });

    return (systemListItems);
  }

  renderSystemProjectWorkSpace(systemListItems) {
    return (
      <div className='sidebar-project'>
        <div className='title sticky'>
          <span className='float-left-project'>
            Automated Discovery
          </span>
          <span className='float-clear' />
        </div>
        <div
          className='auto-project-list system-project-list-layout'
          onMouseLeave={this.clearFocus}
        >
          {this.renderSystemProjectList(systemListItems)}
        </div>
      </div>
    );
  }

  renderManualProjectWorkSpace(autoProjNumber) {
    const { roleConfig } = this.props;
    let styleListHeight = '';
    let titleStyle = 'sub-title sticky';
    if (autoProjNumber === 0) {
      titleStyle = 'title sticky';
      styleListHeight = 'project-list project-list-height';
    } else if (autoProjNumber === 1) {
      styleListHeight = 'project-list project-list-height-1auto';
    } else if (autoProjNumber === 2) {
      styleListHeight = 'project-list project-list-height-2auto';
    }

    return (
      <div className='sidebar-project'>
        <div className={titleStyle}>
          <span className='float-left-project'>
            Manual Discovery
          </span>
          <span className='float-right'>
            { roleConfig.uploadNewTranscript ? (
              <IconButton
                onClick={this.onClickCreateProject}
                icon={Plus}
                strokeColor='#ffffff'
                title='Create Project'
              />
            ) : null }
          </span>
          <span className='float-clear' />
        </div>
        <div
          className={styleListHeight}
          onMouseLeave={this.clearFocus}
        >
          {this.renderManualProjectList()}
        </div>
      </div>
    );
  }

  render() {
    const systemListItems = this.getSystemProjectList();
    return (
      <div>
        {(systemListItems.length > 0) && this.renderSystemProjectWorkSpace(systemListItems)}
        {this.renderManualProjectWorkSpace(systemListItems.length)}
      </div>
    );
  }
}

ProjectsSidebar.propTypes = {
  activeProjectId: PropTypes.string,
  caa: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
  projects: PropTypes.object,
  clientId: PropTypes.string,
  roleConfig: PropTypes.object,
};

ProjectsSidebar.defaultProps = {
  dispatch: () => { },
  activeProjectId: '',
  projects: new List([]),
  roleConfig: {},
};

const mapStateToProps = (state) => ({
  activeProjectId: projectSelectors.getActiveProjectId(state) || '',
  caa: getCAASelector(state),
  clientId: getClientIdSelector(state),
  projects: projectSelectors.getProjectsList(state) || new List([]),
  roleConfig: getRoleConfigSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});


export default connect(mapStateToProps, mapDispatchToProps)(ProjectsSidebar);
