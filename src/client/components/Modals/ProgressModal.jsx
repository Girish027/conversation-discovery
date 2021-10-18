import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Button } from '@tfs/ui-components';
import Spinner from '../Status/Spinner';
import constants from '../../constants';

export default class ProgressModal extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const {
      message,
      closeIconVisible,
      showCancelButton,
      onClickCancelButton,
      ...otherProps
    } = this.props;
    return (
      <div>
        <Dialog
          size='small'
          otherDialogProps={{
            shouldFocusAfterRender: false,
          }}
          isOpen
          okVisible={false}
          cancelVisible={false}
          closeIconVisible={closeIconVisible}
          styleOverride={this.styleOverride}
          showHeader={false}
          showFooter={false}
          {...otherProps}
        >
          <div>
            <p style={{ marginBottom: '25px' }}>
              {message}
            </p>
            <Spinner height='50' width='50' />
            {showCancelButton
              ? (
                <Button
                  name='cancel-progress'
                  type='flat'
                  onClick={onClickCancelButton}
                >
                  {constants.buttons.cancel}
                </Button>
              )
              : null }
          </div>
        </Dialog>
      </div>
    );
  }
}

ProgressModal.propTypes = {
  message: PropTypes.string,
  closeIconVisible: PropTypes.bool,
  showCancelButton: PropTypes.bool,
  onClickCancelButton: PropTypes.func,
};

ProgressModal.defaultProps = {
  message: '',
  closeIconVisible: false,
  showCancelButton: false,
  onClickCancelButton: () => {}
};
