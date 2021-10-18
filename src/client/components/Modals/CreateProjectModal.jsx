import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@tfs/ui-components';
import CreateProjectForm from '../Form/CreateProjectForm';
import constants from '../../constants';
import Language from '../../Language';
import { projectActions } from '../../state/projectsState';
import {
  dialogStyles
} from '../../styles';
import {
  setModalIsOpen,
} from 'state/appState';
import * as ValidationUtils from 'utils/ValidationUtils';
import ErrorLayout from './ErrorLayout';

export default class CreateProjectModal extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.onClickOk = this.onClickOk.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.isValid = this.isValid.bind(this);

    this.styleOverride = {
      ...dialogStyles,
      content: {
        maxWidth: '450px',
        maxHeight: '650px',
        left: 'calc((100vw - 450px) / 2)'
      },
    };

    const { formdata } = this.props;
    this.state = {
      projectName: formdata.projectName || '',
      projectDescription: formdata.projectDescription || '',
      datasetFile: null,
      datasetName: '',
    };
  }

  onClickCancel = () => {
    const { dispatch } = this.props;

    dispatch(setModalIsOpen(true, {
      modalName: constants.modals.confirm,
      header: Language.PROJECT.cancelHeader,
      message: Language.PROJECT.cancelMessage,
      onClickOk: this.handleGoBackClick,
    }));
  }

  onClickOk() {
    const { dispatch, caa } = this.props;
    const data = {
      ...caa,
      ...this.state,
    };
    dispatch(projectActions.createProject(data));
  }

  handleGoBackClick = () => {
    const { dispatch } = this.props;

    dispatch(setModalIsOpen(true, {
      modalName: constants.modals.createProject,
      formdata: this.state,
    }));
  }

  isValid() {
    const { projectName, datasetName, datasetFile } = this.state;
    if (datasetFile !== null && ValidationUtils.validateProjectDetails(projectName, datasetName)) {
      return true;
    }
    return false;
  }

  saveChanges(data) {
    this.setState(data);
  }

  saveFile(acceptedFiles) {
    const datasetFile = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.setState({
        datasetFile,
        datasetName: datasetFile.name,
      });
    };
    reader.readAsBinaryString(datasetFile);
  }

  render() {
    const {
      closeIconVisible,
      header,
      error,
      errorType,
      caa,
      formdata,
      projectCreationInProgress,
      ...otherProps
    } = this.props;

    const okChildren = projectCreationInProgress ? constants.buttons.analyzing : constants.buttons.analyze;
    return (
      <Dialog
        size='default'
        headerChildren={header}
        {...otherProps}
        isOpen
        okVisible
        okChildren={okChildren}
        onClickOk={this.onClickOk}
        okDisabled={!this.isValid() || projectCreationInProgress}
        cancelVisible
        cancelChildren={constants.buttons.cancel}
        onClickCancel={this.onClickCancel}
        closeIconVisible={closeIconVisible}
        centerContent={false}
        styleOverride={this.styleOverride}
      >
        <div>
          {errorType && (
            <ErrorLayout styleOverride={{ marginBottom: '15px' }} errorMsg={errorType} />
          )}
          <CreateProjectForm
            saveChanges={this.saveChanges}
            saveFile={this.saveFile}
            error={error}
            errorType={errorType}
            caa={caa}
            formdata={formdata}
          />
        </div>
      </Dialog>
    );
  }
}

CreateProjectModal.propTypes = {
  caa: PropTypes.object.isRequired,
  header: PropTypes.string,
  closeIconVisible: PropTypes.bool,
  dispatch: PropTypes.func,
  error: PropTypes.string,
  errorType: PropTypes.string,
  formdata: PropTypes.object,
  projectCreationInProgress: PropTypes.bool
};

CreateProjectModal.defaultProps = {
  closeIconVisible: true,
  dispatch: () => {},
  header: 'Upload Transcripts',
  error: '',
  errorType: '',
  formdata: {},
  projectCreationInProgress: false
};
