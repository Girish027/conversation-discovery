import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@tfs/ui-components';
import constants from '../../constants';
import Form from '../Form/Form';
import {
  dialogStyles
} from '../../styles';

import editClusterUiSchema from '../../schema/editCluster/uiSchema.json';
import editClusterJsonSchema from '../../schema/editCluster/jsonSchema.json';
import ErrorLayout from './ErrorLayout';
import { clusterActions } from '../../state/clusterState';

export default class EditClusterModal extends Component {
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
        top: '100px',
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
    const { dispatch, clusterId } = this.props;
    const { formData } = this.state;
    const data = {
      type: 'clusterName',
      ...formData
    };
    dispatch(clusterActions.editCluster(clusterId, data));
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
    const { save: okChildren } = buttons;
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
              uiSchema={editClusterUiSchema}
              jsonSchema={editClusterJsonSchema}
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

EditClusterModal.propTypes = {
  dispatch: PropTypes.func,
  header: PropTypes.string,
  clusterId: PropTypes.string.isRequired,
  closeIconVisible: PropTypes.bool,
  onClickOk: PropTypes.func,
  onClickClose: PropTypes.func,
  styleOverride: PropTypes.object,
  errorType: PropTypes.string,
  size: PropTypes.string,
  formData: PropTypes.object,
};

EditClusterModal.defaultProps = {
  dispatch: () => {},
  closeIconVisible: true,
  onClickOk: () => {},
  onClickClose: () => {},
  styleOverride: {},
  size: 'small',
  errorType: '',
  formData: {},
  header: constants.modalInfo.editCluster.header,

};
