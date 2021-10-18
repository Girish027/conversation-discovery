import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@tfs/ui-components';
import constants from '../../constants';
import Form from '../Form/Form';
import {
  runActions,
} from 'state/runsState';
import {
  dialogStyles
} from '../../styles';

import editRunUiSchema from '../../schema/editRun/uiSchema.json';
import editRunJsonSchema from '../../schema/editRun/jsonSchema.json';
import ErrorLayout from './ErrorLayout';

export default class EditRunModal extends Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.props = props;

    this.onClickStart = this.onClickStart.bind(this);
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

  onClickStart() {
    this.form.current.submit();
  }

  onClickCancel() {
    const { onClickClose } = this.props;

    onClickClose();
  }

  onSubmit() {
    const { dispatch, runId } = this.props;
    const { formData } = this.state;
    const { runName = '', runDescription = '' } = formData;
    dispatch(runActions.editRun(runId, { runName, runDescription }));
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
          onClickOk={this.onClickStart}
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

EditRunModal.propTypes = {
  dispatch: PropTypes.func,
  header: PropTypes.string,
  runId: PropTypes.string.isRequired,
  closeIconVisible: PropTypes.bool,
  onClickOk: PropTypes.func,
  onClickClose: PropTypes.func,
  styleOverride: PropTypes.object,
  errorType: PropTypes.string,
  size: PropTypes.string,
  formData: PropTypes.object,
};

EditRunModal.defaultProps = {
  dispatch: () => {},
  closeIconVisible: true,
  onClickOk: () => {},
  onClickClose: () => {},
  styleOverride: {},
  size: 'small',
  errorType: '',
  formData: {},
  header: constants.modalInfo.editRun.header,

};
