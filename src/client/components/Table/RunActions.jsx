import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Xmark,
  Pencil,
  Download
} from '@tfs/ui-components';
import IconButton from 'components/IconButton';
import {
  setModalIsOpen,
} from 'state/appState';
import Constants from '../../constants';
import { runActions } from 'state/runsState';
import * as globalActions from 'state/globalActions';

class RunActions extends Component {
  constructor() {
    super();

    this.iconProps = {
      padding: '5px',
      height: 12,
      width: 12,
    };
  }

  onClickEdit = (event) => {
    event.stopPropagation();
    const { dispatch, runId, ...runInfo } = this.props;
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.editRun,
      runId,
      formData: runInfo,
    }));
  }

  onClickConfirmDelete = () => {
    const { dispatch, runId } = this.props;
    dispatch(runActions.deleteRun(runId));
  }

  onClickDelete = (event) => {
    event.stopPropagation();
    const { dispatch, runName } = this.props;
    dispatch(setModalIsOpen(true, {
      modalName: Constants.modals.confirm,
      deleteMode: true,
      header: `Delete "${runName}"?`,
      message: 'These analysis results will be gone forever. Are you sure you want to delete this item?',
      onClickOk: this.onClickConfirmDelete,
    }));
  }

  onClickDownload = (event) => {
    event.stopPropagation();
    const { dispatch, runId } = this.props;
    dispatch(globalActions.downloadResults(Constants.serverApiUrls.downloadRun, runId));
  }

  renderDeleteIcon = () => {
    const { runStatus } = this.props;
    let disabled = false;
    switch (runStatus) {
      case Constants.status.QUEUED:
      case Constants.status.IN_PROGRESS:
        disabled = true;
        break;
      default:
        break;
    }
    return (
      <IconButton
        onClick={this.onClickDelete}
        icon={Xmark}
        data-qa={'delete-run'}
        title='Delete'
        disabled={disabled}
        {...this.iconProps}
      />
    );
  }

  renderEditIcon = () => (
    <IconButton
      onClick={this.onClickEdit}
      icon={Pencil}
      defaultColor='none'
      strokeColor='#004c97'
      data-qa={'edit-run'}
      title='Edit'
      {...this.iconProps}
    />
  )

  renderDownloadIcon = () => {
    const { runStatus, projectType } = this.props;
    let disabled = true;
    if (runStatus === Constants.status.READY && projectType !== Constants.projects.SYSTEM) {
      disabled = false;
    }
    return (
      <IconButton
        onClick={this.onClickDownload}
        icon={Download}
        data-qa={'delete-run'}
        title='Download Run Results'
        disabled={disabled}
        {...this.iconProps}
      />
    );
  }

  render() {
    const { roleConfig } = this.props;
    return (
      <div className='float-left'>
        { roleConfig.deleteAnalysis ? this.renderDeleteIcon() : null }
        {this.renderDownloadIcon()}
        { roleConfig.updateAnalysis ? this.renderEditIcon() : null }
      </div>
    );
  }
}

RunActions.propTypes = {
  runName: PropTypes.string.isRequired,
  runDescription: PropTypes.string,
  runId: PropTypes.string.isRequired,
  runStatus: PropTypes.string.isRequired,
  dispatch: PropTypes.func,
  projectType: PropTypes.string,
  roleConfig: PropTypes.object,
};

RunActions.defaultProps = {
  runDescription: '',
  roleConfig: {},
};

export default RunActions;
