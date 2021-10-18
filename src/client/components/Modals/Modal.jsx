/* eslint-disable import/no-named-as-default */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  setModalIsOpen,
  getModalStateSelector,
  getCAASelector,
} from '../../state/appState';
import { getProjectCreationInProgress } from 'state/projectsState';
import { getconversationsAddingInProgress, addConversationsComplete } from 'state/conversationsState';
import {
  dialogStyles
} from '../../styles';
import constants from '../../constants';
import ProgressModal from './ProgressModal';
import CreateProjectModal from './CreateProjectModal';
import ConfirmationModal from './ConfirmationModal';
import SimpleModal from './SimpleModal';
import CreateRunModal from './CreateRun/CreateRunModal';
import EditRunModal from './EditRunModal';
import EditProjectModal from './EditProjectModal';
import EditClusterModal from './EditClusterModal';
// eslint-disable-next-line import/no-named-as-default
import AddToBotModal from './AddToBotModal';
import AddToFaqModal from './AddToFaqModal';

export class Modal extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.closeModal = this.closeModal.bind(this);
    this.getSpecificModal = this.getSpecificModal.bind(this);
    this.handleEscapeKey = this.handleEscapeKey.bind(this);

    this.generalProps = {
      onClickClose: this.closeModal,
      onClickCancel: this.closeModal,
      styleOverride: dialogStyles,
      dispatch: props.dispatch,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleEscapeKey, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleEscapeKey, false);
  }

  getSpecificModal() {
    const { caa } = this.props;
    const { modalName, ...modalProps } = this.props.modalState;
    const { modals } = constants;
    switch (modalName) {
      case modals.confirm:
        return (<ConfirmationModal caa={caa} {...this.generalProps} {...modalProps} />);
      case modals.progress:
        return (<ProgressModal caa={caa} {...this.generalProps} {...modalProps} />);
      case modals.createProject: {
        const { projectCreationInProgress } = this.props;
        return (<CreateProjectModal caa={caa} {...this.generalProps} {...modalProps} projectCreationInProgress={projectCreationInProgress} />);
      }
      case modals.editProject:
        return (<EditProjectModal {...this.generalProps} {...modalProps} />);
      case modals.createRun:
        return (<CreateRunModal {...this.generalProps} {...modalProps} />);
      case modals.editRun:
        return (<EditRunModal {...this.generalProps} {...modalProps} />);
      case modals.editCluster:
        return (<EditClusterModal {...this.generalProps} {...modalProps} />);
      case modals.unauthorized:
        return (<SimpleModal {...this.generalProps} {...modalProps} />);
      case modals.addToBot: {
        const { conversationsAddingInProgress } = this.props;
        return (<AddToBotModal {...this.generalProps} {...modalProps} conversationsAddingInProgress={conversationsAddingInProgress} />);
      }
      case modals.addToFaq: {
        const { conversationsAddingInProgress } = this.props;
        return (<AddToFaqModal {...this.generalProps} {...modalProps} conversationsAddingInProgress={conversationsAddingInProgress} />);
      }
      default: return null;
    }
  }

  closeModal() {
    const { dispatch } = this.props;
    dispatch(setModalIsOpen(false));
    dispatch(addConversationsComplete(true));
  }

  handleEscapeKey(event) {
    if (event.keyCode === 27) {
      event.preventDefault();
      const { dispatch } = this.props;
      dispatch(setModalIsOpen(false));
    }
  }

  render() {
    return this.getSpecificModal();
  }
}

Modal.propTypes = {
  caa: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
  modalState: PropTypes.object,
  projectCreationInProgress: PropTypes.bool,
  conversationsAddingInProgress: PropTypes.bool
};

Modal.defaultProps = {
  modalState: {},
  dispatch: () => {},
  projectCreationInProgress: false,
  conversationsAddingInProgress: false
};

const mapStateToProps = (state) => ({
  caa: getCAASelector(state),
  modalState: getModalStateSelector(state),
  projectCreationInProgress: getProjectCreationInProgress(state),
  conversationsAddingInProgress: getconversationsAddingInProgress(state)
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
