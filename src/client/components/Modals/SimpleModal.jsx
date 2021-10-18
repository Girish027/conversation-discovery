import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@tfs/ui-components';
import constants from '../../constants';

export default class SimpleModal extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.onClickOk = this.onClickOk.bind(this);
  }

  onClickOk() {
    const { onClickOkButton, onClickClose } = this.props;
    onClickClose();
    onClickOkButton();
  }

  render() {
    const {
      message, header, styleOverride, ...otherProps
    } = this.props;
    const { buttons } = constants;
    const { ok: okChildren } = buttons;
    const { cancel: cancelChildren } = buttons;

    return (
      <div>
        <Dialog
          size='small'
          headerChildren={header}
          isOpen
          okVisible
          okChildren={okChildren}
          cancelVisible
          cancelChildren={cancelChildren}
          closeIconVisible={false}
          styleOverride={styleOverride}
          onClickOk={this.onClickOk}
          centerContent={false}
          {...otherProps}
        >
          <div style={{ padding: '0px 30px 0px 30px' }}>
            {message}
          </div>
        </Dialog>
      </div>
    );
  }
}

SimpleModal.propTypes = {
  message: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  closeIconVisible: PropTypes.bool,
  onClickOkButton: PropTypes.func,
  onClickClose: PropTypes.func,
  onClickCancel: PropTypes.func,
  styleOverride: PropTypes.object,
};

SimpleModal.defaultProps = {
  closeIconVisible: true,
  onClickOkButton: () => {},
  onClickClose: () => {},
  onClickCancel: () => {},
  styleOverride: {}

};
