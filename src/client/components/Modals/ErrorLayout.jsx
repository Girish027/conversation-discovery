import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { AlertIcon } from '@tfs/ui-components';
import { modalErrorLayout } from '../../styles/index';

export default class ErrorLayout extends PureComponent {
  render() {
    const { errorMsg, styleOverride } = this.props;

    const layoutStyle = Object.assign({}, modalErrorLayout, styleOverride);

    return (
      <div
        style={layoutStyle}
      >
        <AlertIcon />
        {' '}
        {errorMsg}
      </div>
    );
  }
}

ErrorLayout.propTypes = {
  errorMsg: PropTypes.string.isRequired,
  styleOverride: PropTypes.object
};

ErrorLayout.defaultProps = {
  styleOverride: {}
};
