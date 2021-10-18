import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { AlertIcon } from '@tfs/ui-components';
import { validationErrorStyle } from '../styles/customComponentsStyles';

export default class ValidationPlaceholder extends PureComponent {
  render() {
    const { validationMessage } = this.props;

    return (
      <React.Fragment>
        <AlertIcon style={validationErrorStyle.icon} />
        <span
          style={validationErrorStyle.field}
        >
          {' '}
          {validationMessage}
          {' '}
        </span>
      </React.Fragment>
    );
  }
}

ValidationPlaceholder.propTypes = {
  validationMessage: PropTypes.string,
};

ValidationPlaceholder.defaultProps = {
  validationMessage: '',
};
