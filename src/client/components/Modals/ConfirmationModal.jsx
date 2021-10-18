import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@tfs/ui-components';
import constants from '../../constants';

export default class ConfirmationModal extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.onClickOk = this.onClickOk.bind(this);
  }

  onClickOk() {
    const { onClickOk, onClickClose } = this.props;
    onClickClose();
    onClickOk();
  }

  render() {
    const {
      message, header, styleOverride, deleteMode, confirmMode, ...otherProps
    } = this.props;
    const { buttons } = constants;
    let { dontCancel: okChildren } = buttons;
    let { yesCancel: cancelChildren } = buttons;

    if (deleteMode) {
      okChildren = buttons.delete;
      cancelChildren = buttons.cancel;
    }

    if (confirmMode) {
      okChildren = buttons.ok;
      cancelChildren = buttons.cancel;
    }

    return (
      <div>
        <Dialog
          size='small'
          headerChildren={header}
          {...otherProps}
          isOpen
          okVisible
          okChildren={okChildren}
          cancelVisible
          cancelChildren={cancelChildren}
          closeIconVisible={false}
          styleOverride={styleOverride}
          onClickOk={this.onClickOk}
          centerContent={false}
        >
          <div>
            {message}
          </div>
        </Dialog>
      </div>
    );
  }
}

ConfirmationModal.propTypes = {
  message: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  closeIconVisible: PropTypes.bool,
  onClickOk: PropTypes.func,
  onClickClose: PropTypes.func,
  onClickCancel: PropTypes.func,
  styleOverride: PropTypes.object,
  deleteMode: PropTypes.bool,
  confirmMode: PropTypes.bool,
};

ConfirmationModal.defaultProps = {
  closeIconVisible: false,
  deleteMode: false,
  confirmMode: false,
  onClickOk: () => { },
  onClickClose: () => { },
  onClickCancel: () => { },
  styleOverride: {},
};
