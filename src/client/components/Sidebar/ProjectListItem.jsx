import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Xmark,
  Pencil,
  StatusBadge,
} from '@tfs/ui-components';
import IconButton from 'components/IconButton';
import { getDateFromTimestamp } from 'utils/DateUtils';
import { colors } from 'styles';
import { shouldHandle } from 'utils/KeyboardUtils';
import Constants from '../../constants';
import Language from '../../Language';

import { projectActions } from '../../state/projectsState';
import {
  setModalIsOpen,
} from 'state/appState';

class ProjectListItem extends Component {
  constructor() {
    super();

    this.renderDeleteIcon = this.renderDeleteIcon.bind(this);
    this.renderEditIcon = this.renderEditIcon.bind(this);

    this.toggleFocus = this.toggleFocus.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onClickListItem = this.onClickListItem.bind(this);
    this.onClickEdit = this.onClickEdit.bind(this);
    this.onClickDelete = this.onClickDelete.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.renderSystemProjItemList = this.renderSystemProjItemList.bind(this);
    this.renderManualProjItemList = this.renderManualProjItemList.bind(this);

    this.state = {
      focus: false,
    };
  }

  onMouseUp() {
    this.setState({
      focus: false,
    });
  }

  onKeyDown(event) {
    if (shouldHandle(event)) {
      this.onClickListItem();
    }
  }

  onClickEdit(event) {
    event.stopPropagation();
    const { dispatch, projectId, ...projectInfo } = this.props;
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.editProject,
      header: Constants.modalInfo.editProject.header,
      projectId,
      formData: projectInfo,
    }));
  }

  onClickDelete(event) {
    event.stopPropagation();
    const { dispatch, projectName } = this.props;
    // Ask for confirmation - open Confirmation Dialog
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.confirm,
      deleteMode: true,
      header: `Delete "${projectName}"?`,
      message: Language.WARNING_MESSAGE.deleteTranscript,
      onClickOk: this.onClickDeleteButton
    }));
  }

  onClickDeleteButton = () => {
    const { dispatch, projectId } = this.props;
    dispatch(projectActions.deleteProject(projectId));
  }

  onClickListItem() {
    const { projectId, onClickListItem } = this.props;
    onClickListItem(projectId);
  }

  toggleFocus() {
    const { focus } = this.state;
    const { onFocusItem, projectId } = this.props;
    this.setState({
      focus: !focus,
    }, () => {
      onFocusItem(projectId, this.state.focus);
    });
  }

  renderDeleteIcon() {
    return (
      <IconButton
        onClick={this.onClickDelete}
        icon={Xmark}
        data-qa={'delete-project'}
        padding={'3px'}
        title='Delete'
      />
    );
  }

  renderEditIcon() {
    return (
      <IconButton
        onClick={this.onClickEdit}
        icon={Pencil}
        defaultColor='none'
        strokeColor='#004c97'
        data-qa={'edit-project'}
        padding={'3px'}
        title='Edit'
      />
    );
  }

  renderSystemProjItemList() {
    const {
      projectDescription,
      projectStatus,
      modified,
      focused,
      roleConfig,
    } = this.props;

    let badgeCategory = 'primary';
    if (projectStatus === Constants.status.NEW) {
      badgeCategory = 'success';
    }

    return (
      <div>
        <div className='project-name'>
          {Constants.LIVE_DATA_ANALYSIS}
          <StatusBadge
            category={badgeCategory}
            label={projectStatus}
            onHover={() => { }}
            progress='true'
            type='badge'
            styleOverride={{ marginLeft: '20px', paddingTop: '2px' }}
          />
        </div>

        <div className='project-meta'>
          <div style={{ color: '#313f54', marginBottom: '4px' }}>
            {projectDescription}
          </div>
          {`Last Edited: ${getDateFromTimestamp(modified)}`}
        </div>
        {focused && (
          <div className='actions'>
            { roleConfig.deleteTranscripts ? this.renderDeleteIcon() : null }
          </div>
        )}
      </div>
    );
  }

  renderManualProjItemList() {
    const {
      projectName,
      projectDescription,
      modified,
      datasetName,
      focused,
      roleConfig,
    } = this.props;

    return (
      <div>
        <div className='project-name'>
          {projectName}
        </div>

        <div className='project-meta'>
          <div style={{ color: '#313f54' }}>
            {projectDescription}
          </div>
          {`Dataset: ${datasetName}`}
          <br />
          {`Last Edited: ${getDateFromTimestamp(modified)}`}
        </div>
        {focused && (
          <div className='actions'>
            { roleConfig.updateTranscripts ? this.renderEditIcon() : null }
            { roleConfig.deleteTranscripts ? this.renderDeleteIcon() : null }
          </div>
        )}
      </div>
    );
  }

  render() {
    const {
      projectType,
      focused,
      selected,
      sticky,
    } = this.props;
    return (
      <div
        className={`project-list-item ${sticky}`}
        onClick={this.onClickListItem}
        onKeyDown={this.onKeyDown}
        onFocus={this.toggleFocus}
        onBlur={this.toggleFocus}
        onMouseOver={this.toggleFocus}
        onMouseOut={this.toggleFocus}
        onMouseUp={this.onMouseUp}
        role='button'
        tabIndex={0}
        style={{
          backgroundColor: focused ? colors.focusItem : (selected ? colors.selectedItem : ''),
        }}
      >
        { (projectType && projectType === Constants.projects.SYSTEM) ? (
          this.renderSystemProjItemList()
        ) : (
          this.renderManualProjItemList()
        )
        }
      </div>
    );
  }
}

ProjectListItem.propTypes = {
  sticky: PropTypes.string,
  projectName: PropTypes.string.isRequired,
  projectDescription: PropTypes.string,
  projectStatus: PropTypes.string,
  projectType: PropTypes.string,
  projectId: PropTypes.string.isRequired,
  datasetName: PropTypes.string.isRequired,
  modified: PropTypes.number.isRequired,
  focused: PropTypes.bool,
  selected: PropTypes.bool,
  onFocusItem: PropTypes.func,
  onClickListItem: PropTypes.func,
  roleConfig: PropTypes.object,
  dispatch: PropTypes.func,
};

ProjectListItem.defaultProps = {
  projectDescription: '',
  sticky: '',
  focused: false,
  selected: false,
  onFocusItem: () => { },
  onClickListItem: () => { },
  roleConfig: {},
  dispatch: () => {},
};

export default ProjectListItem;
