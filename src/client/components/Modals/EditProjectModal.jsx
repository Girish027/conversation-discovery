import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@tfs/ui-components';
import constants from '../../constants';
import Form from '../Form/Form';
import {
  projectActions,
} from '../../state/projectsState';
import {
  dialogStyles
} from '../../styles';

import editRunUiSchema from '../../schema/editProject/uiSchema.json';
import editRunJsonSchema from '../../schema/editProject/jsonSchema.json';
import ErrorLayout from './ErrorLayout';

export default class EditProjectModal extends Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.props = props;

    this.onClickSubmit = this.onClickSubmit.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleOnchange = this.handleOnchange.bind(this);

    this.styleOverride = Object.assign({}, {
      ...dialogStyles,
      container: {
        width: '450px',
        height: '410px',
        display: 'grid',
        gridTemplateRows: '60px auto 60px',
      },
      childContainer: {
        marginTop: '10px',
        marginBottom: '10px',
      },
      content: {
        maxWidth: '450px',
        maxHeight: '410px',
        left: 'calc((100vw - 450px) / 2)'
      }
    },
    this.props.styleOverride
    );

    this.state = {
      formData: {},
      isValid: false
    };
  }

  onClickSubmit() {
    this.form.current.submit();
  }

  onClickCancel() {
    const { onClickClose } = this.props;

    onClickClose();
  }

  onSubmit() {
    const { dispatch, projectId } = this.props;
    const { formData } = this.state;
    const { projectName = '', projectDescription = '' } = formData;
    dispatch(projectActions.editProject(projectId, { projectName, projectDescription }));
  }

  handleOnchange(data, errors) {
    if (errors.length === 0) {
      this.setState({
        formData: data,
        isValid: true
      });
    } else if (errors.length > 0) {
      this.setState({
        isValid: false
      });
    }
  }

  render() {
    const {
      header, size, formData, errorType, ...otherProps
    } = this.props;

    const { isValid } = this.state;

    const { buttons } = constants;
    const { submit: okChildren } = buttons;
    const { cancel: cancelChildren } = buttons;

    return (
      <div>
        <Dialog
          size={size}
          headerChildren={header}
          {...otherProps}
          isOpen
          okVisible
          okDisabled={!isValid}
          okChildren={okChildren}
          cancelVisible
          cancelChildren={cancelChildren}
          closeIconVisible
          styleOverride={this.styleOverride}
          onClickOk={this.onClickSubmit}
          onClickCancel={this.onClickCancel}
          centerContent={false}
        >
          <div>
            {errorType && (
              <ErrorLayout errorMsg={errorType} />
            )}
            <Form
              uiSchema={editRunUiSchema}
              jsonSchema={editRunJsonSchema}
              onSubmit={this.onSubmit}
              onChange={this.handleOnchange}
              formData={formData}
              ref={this.form}
              liveValidate
            />
          </div>
        </Dialog>
      </div>
    );
  }
}

EditProjectModal.propTypes = {
  dispatch: PropTypes.func,
  header: PropTypes.string,
  projectId: PropTypes.string.isRequired,
  closeIconVisible: PropTypes.bool,
  onClickOk: PropTypes.func,
  onClickClose: PropTypes.func,
  styleOverride: PropTypes.object,
  size: PropTypes.string,
  formData: PropTypes.object,
  errorType: PropTypes.string,
};

EditProjectModal.defaultProps = {
  dispatch: () => {},
  closeIconVisible: true,
  onClickOk: () => {},
  onClickClose: () => {},
  styleOverride: {},
  size: 'small',
  errorType: '',
  header: constants.modalInfo.editProject.header,
};
